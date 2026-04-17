import { useEffect, useMemo, useState } from 'react';

import { Row } from '@/ui/components';
import { Button, ButtonProps } from '@/ui/components/Button';
import { BuyBTCModal } from '@/ui/pages/BuyBTC/BuyBTCModal';
import { TypeChain } from '@unisat/wallet-shared';
import {
  useChainType,
  useI18n,
  useNavigation,
  useResetFeeRateBar,
  useResetUiTxCreateScreen,
  useWalletConfig
} from '@unisat/wallet-state';
import { ChainType } from '@unisat/wallet-types';

interface WalletActionsProps {
  chain: TypeChain;
}

type WalletActionItem = {
  key: string;
  label: string;
  icon: NonNullable<ButtonProps['icon']>;
  onClick: NonNullable<ButtonProps['onClick']>;
  disabled?: boolean;
  priority: number;
  pinned?: boolean;
  overflowPreset?: ButtonProps['preset'];
  dataTestId: string;
};

const MAX_PRIMARY_ACTIONS = 4;

export const WalletActions = ({ chain }: WalletActionsProps) => {
  const [showOverflowActions, setShowOverflowActions] = useState(false);
  const isFractal = chain.isFractal;
  const nav = useNavigation();
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();
  const resetFeeRateBar = useResetFeeRateBar();
  const chainType = useChainType();
  const [buyBtcModalVisible, setBuyBtcModalVisible] = useState(false);
  const walletConfig = useWalletConfig();
  const { t } = useI18n();

  const handleUtxoClick = () => {
    nav.navToUtxoTools();
  };

  const onReceiveClick = () => {
    nav.navigate('ReceiveScreen');
  };

  const onSendClick = () => {
    resetUiTxCreateScreen();
    resetFeeRateBar();
    nav.navigate('TxCreateScreen');
  };

  const buyDisabled = chainType !== ChainType.BITCOIN_MAINNET && chainType !== ChainType.FRACTAL_BITCOIN_MAINNET;

  const actionItems = useMemo<WalletActionItem[]>(() => {
    const items: WalletActionItem[] = [
      {
        key: 'receive',
        label: t('receive'),
        icon: 'receive',
        onClick: onReceiveClick,
        priority: 1,
        pinned: true,
        dataTestId: 'receive-button'
      },
      {
        key: 'send',
        label: t('send'),
        icon: 'send',
        onClick: onSendClick,
        priority: 2,
        pinned: true,
        dataTestId: 'send-button'
      }
    ];

    if (!walletConfig.disableUtxoTools) {
      items.push({
        key: 'utxo',
        label: t('utxo').toUpperCase(),
        icon: 'utxo',
        onClick: handleUtxoClick,
        priority: 3,
        pinned: true,
        dataTestId: 'utxo-button'
      });
    }

    items.push({
      key: 'buy',
      label: t('buy'),
      icon: isFractal ? 'fb' : 'bitcoin',
      onClick: () => setBuyBtcModalVisible(true),
      disabled: buyDisabled,
      priority: 10,
      overflowPreset: 'homeGold',
      dataTestId: 'buy-button'
    });

    return items;
  }, [buyDisabled, handleUtxoClick, isFractal, t, walletConfig.disableUtxoTools]);

  const { primaryActions, overflowActions } = useMemo(() => {
    const pinnedActions = actionItems
      .filter(item => item.pinned)
      .sort((a, b) => a.priority - b.priority);
    const extraActions = actionItems
      .filter(item => !item.pinned)
      .sort((a, b) => a.priority - b.priority);
    const nextPrimaryActions = [...pinnedActions, ...extraActions].slice(0, MAX_PRIMARY_ACTIONS);
    const primaryKeys = new Set(nextPrimaryActions.map(item => item.key));

    return {
      primaryActions: nextPrimaryActions,
      overflowActions: actionItems.filter(item => !primaryKeys.has(item.key))
    };
  }, [actionItems]);

  useEffect(() => {
    setShowOverflowActions(false);
  }, [chain.enum, overflowActions.length]);

  const renderActionButton = (action: WalletActionItem, location: 'primary' | 'overflow') => (
    <Button
      key={action.key}
      text={action.label}
      preset={location === 'overflow' ? action.overflowPreset || 'home' : 'home'}
      icon={action.icon}
      onClick={action.onClick}
      disabled={action.disabled}
      data-testid={action.dataTestId}
    />
  );

  return (
    <>
      <Row justifyCenter mt="md" style={{ flexWrap: 'wrap' }}>
        {primaryActions.map(action => renderActionButton(action, 'primary'))}
        {overflowActions.length > 0 && (
          <Button
            text={t('more')}
            preset={showOverflowActions ? 'homeGold' : 'home'}
            icon="more"
            onClick={() => setShowOverflowActions(prev => !prev)}
            data-testid="more-button"
          />
        )}
      </Row>

      {showOverflowActions && overflowActions.length > 0 && (
        <Row justifyCenter mt="md" style={{ flexWrap: 'wrap' }}>
          {overflowActions.map(action => renderActionButton(action, 'overflow'))}
        </Row>
      )}

      {buyBtcModalVisible && (
        <BuyBTCModal
          onClose={() => {
            setBuyBtcModalVisible(false);
          }}
        />
      )}
    </>
  );
};
