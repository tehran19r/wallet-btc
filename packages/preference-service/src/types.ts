/**
 * Cross-platform preference service types
 */

import { EventEmitter } from 'eventemitter3';

// Re-export common types (these should come from @unisat/wallet-types)
export interface Account {
  address: string;
  pubkey: string;
  type: string;
  brandName: string;
  alianName?: string;
  displayBrandName?: string;
  index?: number;
  balance?: number;
}

export interface BitcoinBalance {
  confirm_amount: string;
  pending_amount: string;
  amount: string;
  confirm_btc_amount: string;
  pending_btc_amount: string;
  btc_amount: string;
  confirm_inscription_amount: string;
  pending_inscription_amount: string;
  inscription_amount: string;
  usd_value: string;
}

export interface TxHistoryItem {
  txid: string;
  time: number;
  date: string;
  amount: string;
  symbol: string;
  address: string;
}

export interface Inscription {
  inscriptionId: string;
  inscriptionNumber: number;
  address: string;
  outputValue: number;
  content: string;
  contentType: string;
  preview: string;
  title: string;
  desc: string;
}

export interface TokenBalance {
  ticker: string;
  overallBalance: string;
  availableBalance: string;
  transferableBalance: string;
  availableBalanceSafe: string;
  availableBalanceUnSafe: string;
}

export interface TokenTransfer {
  ticker: string;
  amount: string;
  inscriptionId: string;
  inscriptionNumber: number;
}

export interface AddressTokenSummary {
  tokenBalance: TokenBalance;
  tokenInfo: any;
  historyList: any[];
  transferableList: TokenTransfer[];
}

export interface AppSummary {
  apps: any[];
}

export interface AddressSummary {
  totalSatoshis: number;
  btcSatoshis: number;
  assetSatoshis: number;
}

// Enums
export enum NetworkType {
  MAINNET = 'livenet',
  TESTNET = 'testnet',
  REGTEST = 'regtest'
}

export enum ChainType {
  BITCOIN_MAINNET = 'BITCOIN_MAINNET',
  BITCOIN_TESTNET = 'BITCOIN_TESTNET',
  BITCOIN_REGTEST = 'BITCOIN_REGTEST'
}

export enum AddressType {
  P2PKH = 0,
  P2WPKH = 1,
  P2TR = 2,
  P2SH_P2WPKH = 3,
  M44_P2WPKH = 4,
  M44_P2TR = 5
}

export enum AddressFlagType {
  Is_Enable_Atomicals = 1,
  CONFIRMED_UTXO_MODE = 2
}

// Base preference store structure
export interface BasePreferenceStore {
  // Account management
  currentKeyringIndex: number;
  currentAccount: Account | undefined | null;
  editingKeyringIndex: number;
  editingAccount: Account | undefined | null;
  
  // User preferences
  locale: string;
  currency: string;
  externalLinkAck: boolean;
  enableSignData: boolean;
  showSafeNotice: boolean;
  
  // Network and address configuration
  chainType: ChainType;
  networkType: NetworkType;
  addressType: AddressType;
  
  // Data maps
  balanceMap: {
    [address: string]: BitcoinBalance;
  };
  historyMap: {
    [address: string]: TxHistoryItem[];
  };
  watchAddressPreference: Record<string, number>;
  walletSavedList: any[];
  alianNames?: Record<string, string>;
  keyringAlianNames: {
    [key: string]: string;
  };
  accountAlianNames: {
    [key: string]: string;
  };
  addressFlags: { [key: string]: number };
  
  // UI and app data
  uiCachedData: {
    [address: string]: {
      allInscriptionList: {
        currentPage: number;
        pageSize: number;
        total: number;
        list: Inscription[];
      }[];
      brc20List: {
        currentPage: number;
        pageSize: number;
        total: number;
        list: TokenBalance[];
      }[];
      brc20Summary: {
        [ticker: string]: AddressTokenSummary;
      };
      brc20TransferableList: {
        [ticker: string]: {
          currentPage: number;
          pageSize: number;
          total: number;
          list: TokenTransfer[];
        }[];
      };
    };
  };
  appTab: {
    summary: AppSummary;
    readTabTime: number;
    readAppTime: { [key: string]: number };
  };
  
  // Version management
  initAlianNames: boolean;
  currentVersion: string;
  firstOpen: boolean;
  skippedVersion: string;
  
  // Extension-specific fields (optional)
  autoLockTimeId?: number;
  openInSidePanel?: boolean;
  developerMode?: boolean;
  
  // Mobile-specific fields (optional)
  guideReaded?: boolean;
  addressSummary?: {
    [address: string]: AddressSummary;
  };
}

// Extension-specific additions
export interface ExtensionPreferenceStore extends BasePreferenceStore {
  autoLockTimeId: number;
  openInSidePanel: boolean;
  developerMode: boolean;
}

// Mobile-specific additions
export interface MobilePreferenceStore extends BasePreferenceStore {
  guideReaded: boolean;
  addressSummary: {
    [address: string]: AddressSummary;
  };
}

// Storage adapter interface
export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  createPersistentProxy<T extends object>(name: string, template: T): Promise<T>;
}

// Locale adapter interface
export interface LocaleAdapter {
  getAcceptLanguages(): Promise<string[]>;
  changeLanguage(locale: string): void;
}

// Service configuration
export interface PreferenceServiceConfig<T extends BasePreferenceStore> {
  storage: StorageAdapter;
  locale?: LocaleAdapter;
  logger?: any;
  t?: any;
  eventBus?: EventEmitter;
  template: T;
  supportedLocales?: string[];
  platformDefaults?: Partial<T>;
}

// Service events
export interface PreferenceServiceEvents {
  'account:changed': (account: Account | null) => void;
  'locale:changed': (locale: string) => void;
  'currency:changed': (currency: string) => void;
  'chain:changed': (chainType: ChainType) => void;
  'preference:updated': (key: string, value: any) => void;
  'preference:error': (error: Error) => void;
}

// Migration interface
export interface MigrationHandler {
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => any;
}