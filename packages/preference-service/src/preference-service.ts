/**
 * Cross-platform preference management service
 */

import { EventEmitter } from 'eventemitter3';
import cloneDeep from 'lodash/cloneDeep';
import {
  BasePreferenceStore,
  PreferenceServiceConfig,
  PreferenceServiceEvents,
  StorageAdapter,
  LocaleAdapter,
  Account,
  BitcoinBalance,
  TxHistoryItem,
  ChainType,
  AddressFlagType
} from './types';
import { MigrationManager, commonMigrations } from './utils/migration';

export class PreferenceService<T extends BasePreferenceStore> extends EventEmitter<PreferenceServiceEvents> {
  protected store!: T;
  protected storage: StorageAdapter;
  protected locale: LocaleAdapter | undefined;
  protected logger: any;
  protected t: any;
  protected eventBus: EventEmitter | undefined;
  protected template: T;
  protected supportedLocales: string[];
  protected platformDefaults: Partial<T>;
  protected migrationManager: MigrationManager;
  
  // State flags
  protected initialized = false;
  public popupOpen = false;
  public hasOtherProvider = false;

  constructor(config: PreferenceServiceConfig<T>) {
    super();
    
    this.storage = config.storage;
    this.locale = config.locale;
    this.logger = config.logger || console;
    this.t = config.t || ((key: string) => key);
    this.eventBus = config.eventBus;
    this.template = config.template;
    this.supportedLocales = config.supportedLocales || ['en'];
    this.platformDefaults = config.platformDefaults || {};
    
    // Setup migration manager
    this.migrationManager = new MigrationManager();
    commonMigrations.forEach(migration => this.migrationManager.addMigration(migration));
  }

  /**
   * Initialize the preference service
   */
  async init(reset?: boolean): Promise<void> {
    if (this.initialized && !reset) {
      return;
    }

    try {
      // Get default locale
      let defaultLang = 'en';
      if (this.locale) {
        const browserLangs = await this.locale.getAcceptLanguages();
        if (browserLangs.length > 0) {
          const supportedLang = browserLangs.find(lang => 
            this.supportedLocales.includes(lang.replace(/-/g, '_'))
          );
          if (supportedLang) {
            defaultLang = supportedLang.replace(/-/g, '_');
          }
        }
      }

      // Merge template with platform defaults
      const finalTemplate = {
        ...this.template,
        ...this.platformDefaults,
        locale: defaultLang
      } as T;

      // Create persistent store
      this.store = await this.storage.createPersistentProxy('preference', finalTemplate);

      // Validate and fix store data
      await this.validateAndFixStore(defaultLang);

      // Set initial language
      if (this.locale && this.store.locale) {
        this.locale.changeLanguage(this.store.locale);
      }

      this.initialized = true;
      this.logger.debug('[PreferenceService] Initialized successfully');
    } catch (error) {
      this.logger.error('[PreferenceService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Validate and fix store data
   */
  private async validateAndFixStore(defaultLang: string): Promise<void> {
    // Ensure locale is supported
    if (!this.supportedLocales.includes(this.store.locale)) {
      this.store.locale = defaultLang;
    }

    // Set default values for optional fields
    if (!this.store.currency) {
      this.store.currency = 'USD';
    }

    if (typeof this.store.externalLinkAck !== 'boolean') {
      this.store.externalLinkAck = false;
    }

    if (typeof this.store.enableSignData !== 'boolean') {
      this.store.enableSignData = false;
    }

    if (typeof this.store.showSafeNotice !== 'boolean') {
      this.store.showSafeNotice = true;
    }

    if (!this.store.balanceMap) {
      this.store.balanceMap = {};
    }

    if (!this.store.historyMap) {
      this.store.historyMap = {};
    }

    if (!this.store.walletSavedList) {
      this.store.walletSavedList = [];
    }

    if (!this.store.keyringAlianNames) {
      this.store.keyringAlianNames = {};
    }

    if (!this.store.accountAlianNames) {
      this.store.accountAlianNames = {};
    }

    if (!this.store.addressFlags) {
      this.store.addressFlags = {};
    }

    if (!this.store.uiCachedData) {
      this.store.uiCachedData = {};
    }

    if (!this.store.appTab) {
      this.store.appTab = { 
        summary: { apps: [] }, 
        readTabTime: 1, 
        readAppTime: {} 
      };
    }

    if (!this.store.appTab.readAppTime) {
      this.store.appTab.readAppTime = {};
    }

    // Validate current account
    if (this.store.currentAccount && !this.store.currentAccount.pubkey) {
      // Old version account format, reset
      this.store.currentAccount = undefined;
    }
  }

  /**
   * Get current account
   */
  getCurrentAccount(): Account | null {
    return cloneDeep(this.store.currentAccount) || null;
  }

  /**
   * Set current account
   */
  setCurrentAccount(account?: Account | null): void {
    this.store.currentAccount = account;
    if (account) {
      this.emit('account:changed', account);
      if (this.eventBus) {
        this.eventBus.emit('accountsChanged', [account.address]);
      }
    }
  }

  /**
   * Popup state management
   */
  setPopupOpen(isOpen: boolean): void {
    this.popupOpen = isOpen;
  }

  getPopupOpen(): boolean {
    return this.popupOpen;
  }

  /**
   * Address balance management
   */
  updateAddressBalance(address: string, data: BitcoinBalance): void {
    const balanceMap = this.store.balanceMap || {};
    this.store.balanceMap = {
      ...balanceMap,
      [address]: data
    };
  }

  removeAddressBalance(address: string): void {
    if (address in this.store.balanceMap) {
      const map = { ...this.store.balanceMap };
      delete map[address];
      this.store.balanceMap = map;
    }
  }

  getAddressBalance(address: string): BitcoinBalance | null {
    const balanceMap = this.store.balanceMap || {};
    return balanceMap[address] || null;
  }

  /**
   * Address history management
   */
  updateAddressHistory(address: string, data: TxHistoryItem[]): void {
    const historyMap = this.store.historyMap || {};
    this.store.historyMap = {
      ...historyMap,
      [address]: data
    };
  }

  removeAddressHistory(address: string): void {
    if (address in this.store.historyMap) {
      const map = { ...this.store.historyMap };
      delete map[address];
      this.store.historyMap = map;
    }
  }

  getAddressHistory(address: string): TxHistoryItem[] {
    const historyMap = this.store.historyMap || {};
    return historyMap[address] || [];
  }

  /**
   * External link acknowledgment
   */
  getExternalLinkAck(): boolean {
    return this.store.externalLinkAck;
  }

  setExternalLinkAck(ack = false): void {
    this.store.externalLinkAck = ack;
  }

  /**
   * Locale management
   */
  getLocale(): string {
    return this.store.locale;
  }

  setLocale(locale: string): void {
    this.store.locale = locale;
    if (this.locale) {
      this.locale.changeLanguage(locale);
    }
    this.emit('locale:changed', locale);
  }

  /**
   * Currency management
   */
  getCurrency(): string {
    return this.store.currency;
  }

  setCurrency(currency: string): void {
    this.store.currency = currency;
    this.emit('currency:changed', currency);
  }

  /**
   * Chain type management
   */
  getChainType(): ChainType {
    return this.store.chainType;
  }

  setChainType(chainType: ChainType): void {
    this.store.chainType = chainType;
    this.emit('chain:changed', chainType);
  }

  /**
   * Current keyring index
   */
  getCurrentKeyringIndex(): number {
    return this.store.currentKeyringIndex;
  }

  setCurrentKeyringIndex(keyringIndex: number): void {
    this.store.currentKeyringIndex = keyringIndex;
  }

  /**
   * Keyring alias names
   */
  setKeyringAlianName(keyringKey: string, name: string): void {
    this.store.keyringAlianNames = Object.assign({}, this.store.keyringAlianNames, { [keyringKey]: name });
  }

  getKeyringAlianName(keyringKey: string, defaultName?: string): string {
    const name = this.store.keyringAlianNames[keyringKey];
    if (!name && defaultName) {
      this.store.keyringAlianNames[keyringKey] = defaultName;
    }
    return this.store.keyringAlianNames[keyringKey] || '';
  }

  /**
   * Account alias names
   */
  setAccountAlianName(accountKey: string, name: string): void {
    this.store.accountAlianNames = Object.assign({}, this.store.accountAlianNames, { [accountKey]: name });
  }

  getAccountAlianName(accountKey: string, defaultName?: string): string {
    const name = this.store.accountAlianNames[accountKey];
    if (!name && defaultName) {
      this.store.accountAlianNames[accountKey] = defaultName;
    }
    return this.store.accountAlianNames[accountKey] || '';
  }

  /**
   * Address flags management
   */
  getAddressFlag(address: string): number {
    return this.store.addressFlags[address] || 0;
  }

  setAddressFlag(address: string, flag: number): void {
    this.store.addressFlags = Object.assign({}, this.store.addressFlags, { [address]: flag });
  }

  addAddressFlag(address: string, flag: AddressFlagType): number {
    const finalFlag = (this.store.addressFlags[address] || 0) | flag;
    this.store.addressFlags = Object.assign({}, this.store.addressFlags, { [address]: finalFlag });
    return finalFlag;
  }

  removeAddressFlag(address: string, flag: AddressFlagType): number {
    const finalFlag = (this.store.addressFlags[address] || 0) & ~flag;
    this.store.addressFlags = Object.assign({}, this.store.addressFlags, { [address]: finalFlag });
    return finalFlag;
  }

  /**
   * Editing state
   */
  getEditingKeyringIndex(): number {
    return this.store.editingKeyringIndex;
  }

  setEditingKeyringIndex(keyringIndex: number): void {
    this.store.editingKeyringIndex = keyringIndex;
  }

  getEditingAccount(): Account | null {
    return cloneDeep(this.store.editingAccount) || null;
  }

  setEditingAccount(account?: Account | null): void {
    this.store.editingAccount = account;
  }

  /**
   * UI cached data management
   */
  getUICachedData(address: string): any {
    if (!this.store.uiCachedData[address]) {
      this.store.uiCachedData[address] = {
        allInscriptionList: [],
        brc20List: [],
        brc20Summary: {},
        brc20TransferableList: {}
      };
    }
    return this.store.uiCachedData[address];
  }

  expireUICachedData(address: string): void {
    this.store.uiCachedData[address] = {
      allInscriptionList: [],
      brc20List: [],
      brc20Summary: {},
      brc20TransferableList: {}
    };
  }

  /**
   * App tab management
   */
  getAppTab(): any {
    return this.store.appTab;
  }

  setAppSummary(appSummary: any): void {
    this.store.appTab.summary = appSummary;
  }

  setReadTabTime(timestamp: number): void {
    this.store.appTab.readTabTime = timestamp;
  }

  setReadAppTime(appid: number, timestamp: number): void {
    this.store.appTab.readAppTime[appid] = timestamp;
  }

  /**
   * Safety and preferences
   */
  getShowSafeNotice(): boolean {
    return this.store.showSafeNotice;
  }

  setShowSafeNotice(showSafeNotice: boolean): void {
    this.store.showSafeNotice = showSafeNotice;
  }

  getEnableSignData(): boolean {
    return this.store.enableSignData;
  }

  setEnableSignData(enableSignData: boolean): void {
    this.store.enableSignData = enableSignData;
  }

  /**
   * Version management
   */
  getSkippedVersion(): string {
    return this.store.skippedVersion;
  }

  setSkippedVersion(version: string): void {
    this.store.skippedVersion = version;
  }

  /**
   * Get wallet saved list
   */
  getWalletSavedList(): any[] {
    return this.store.walletSavedList || [];
  }

  updateWalletSavedList(list: any[]): void {
    this.store.walletSavedList = list;
  }

  /**
   * Init alian names status
   */
  getInitAlianNameStatus(): boolean {
    return this.store.initAlianNames;
  }

  changeInitAlianNameStatus(): void {
    this.store.initAlianNames = true;
  }

  /**
   * First open management
   */
  getIsFirstOpen(): boolean {
    // Note: This method would need version comparison logic
    // For now, just return the stored value
    return this.store.firstOpen;
  }

  updateIsFirstOpen(): void {
    this.store.firstOpen = false;
  }

  /**
   * Address type (deprecated but kept for compatibility)
   */
  getAddressType(): any {
    return this.store.addressType;
  }

  /**
   * Network type (commented out in original but included for completeness)
   */
  getNetworkType(): any {
    return this.store.networkType;
  }

  setNetworkType(networkType: any): void {
    this.store.networkType = networkType;
  }

  /**
   * Auto lock time management (Extension-specific)
   */
  getAutoLockTimeId(): number {
    return (this.store as any).autoLockTimeId || 0;
  }

  setAutoLockTimeId(id: number): void {
    (this.store as any).autoLockTimeId = id;
  }

  /**
   * Side panel preference (Extension-specific)
   */
  getOpenInSidePanel(): boolean {
    return (this.store as any).openInSidePanel || false;
  }

  setOpenInSidePanel(openInSidePanel: boolean): void {
    (this.store as any).openInSidePanel = openInSidePanel;
  }

  /**
   * Developer mode (Extension-specific)
   */
  getDeveloperMode(): boolean {
    return (this.store as any).developerMode || false;
  }

  setDeveloperMode(developerMode: boolean): void {
    (this.store as any).developerMode = developerMode;
  }

  /**
   * Guide read status (Mobile-specific)
   */
  getGuideReaded(): boolean {
    return (this.store as any).guideReaded || false;
  }

  setGuideReaded(guideReaded: boolean): void {
    (this.store as any).guideReaded = guideReaded;
  }

  /**
   * Address summary management (Mobile-specific)
   */
  getAddressSummary(address: string): any {
    const summaryMap = (this.store as any).addressSummary || {};
    return summaryMap[address] || null;
  }

  setAddressSummary(address: string, summary: any): void {
    const summaryMap = (this.store as any).addressSummary || {};
    (this.store as any).addressSummary = {
      ...summaryMap,
      [address]: summary
    };
  }

  /**
   * Get raw store for advanced usage
   */
  protected getStore(): T {
    return this.store;
  }
}