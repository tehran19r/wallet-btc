import { Column, Icon, Image, Row, Text, Tooltip } from '@/ui/components';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { RefreshButton } from '@/ui/components/RefreshButton';
import { fontSizes } from '@/ui/theme/font';
import { useBalanceCardLogic } from '@unisat/wallet-state';

import { BtcDisplay } from './BtcDisplay';

export function BalanceCard() {
  const {
    totalBalance,
    availableAmount,
    unavailableAmount,

    balanceValue,
    chain,
    t,
    isCurrentChainBalance,
    showUtxoToolButton,

    handleUnlock,

    isDetailExpanded,
    handleExpandToggle,

    isBalanceHidden,
    handleHiddenToggle,

    refreshBalance
  } = useBalanceCardLogic();

  const backgroundImage = chain.isFractal
    ? './images/artifacts/balance-bg-fb.png'
    : './images/artifacts/balance-bg-btc.png';

  return (
    <Column
      style={{
        background: 'linear-gradient(117deg, #ffda8d 1.38%, #bf630f 94.19%)',
        borderRadius: 16,
        padding: 8,
        position: 'relative'
      }}>
      <Column style={{ padding: 8 }} gap={'md'}>
        <Image src={backgroundImage} size={64} style={{ position: 'absolute', top: 0, right: 0 }} />
        <Row>
          <Text size="sm" text={t('total_balance')} style={{ color: 'rgba(0,0,0,0.55)' }} />
          <Row
            onClick={() => {
              handleHiddenToggle();
            }}>
            <Icon color={'black_muted'} icon={isBalanceHidden ? 'balance-eyes-closed' : 'balance-eyes'} size={20} />
          </Row>
          <RefreshButton onClick={refreshBalance as any} hideText />
        </Row>

        <Row itemsCenter>
          <BtcDisplay balance={balanceValue} hideBalance={isBalanceHidden} />
          <Icon
            color={'black_muted'}
            size={16}
            icon={isDetailExpanded ? 'up' : 'down'}
            onClick={() => {
              handleExpandToggle();
            }}
          />
        </Row>

        {isCurrentChainBalance && (
          <BtcUsd color={'black_muted'} sats={totalBalance} size={'md'} hideBalance={isBalanceHidden} />
        )}
      </Column>

      {isDetailExpanded && isCurrentChainBalance && (
        <Row
          justifyBetween
          itemsCenter
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#F1CC9F',
            borderRadius: 16
          }}>
          <Column style={{ flex: 1 }} gap={'zero'}>
            <Row>
              <Text color={'black_65'} size="xs" text={t('available')} style={{ fontWeight: 500 }}></Text>
              <Row style={{ height: 20 }} />
            </Row>
            <BtcDisplay preset="sub" balance={availableAmount} hideBalance={isBalanceHidden} />
          </Column>

          <div
            style={{
              width: 1,
              borderWidth: 1,
              height: '100%',
              borderColor: 'rgba(109, 65, 0, 0.15)'
            }}
          />

          <Column style={{ flex: 1 }} gap={'zero'}>
            <Row itemsCenter>
              <Text color={'black_65'} size="xs" text={t('unavailable')} style={{ fontWeight: 500 }}></Text>
              <Tooltip
                title={`If your balance shows as unavailable, it may be because your UTXOs are locked due to containing inscriptions, runes, brc-20 assets, or being unconfirmed. In most cases, you can use our UTXO Management Tool to unlock these UTXOs and make them spendable again. `}
                overlayStyle={{
                  fontSize: fontSizes.xs
                }}>
                <Icon icon="balance-question" size={20} />
              </Tooltip>
            </Row>
            <BtcDisplay preset="sub" balance={unavailableAmount} hideBalance={isBalanceHidden} />
          </Column>

          {showUtxoToolButton ? (
            <Icon
              style={{ flex: 1, cursor: 'pointer' }}
              icon={'unlock'}
              size={28}
              onClick={() => {
                handleUnlock();
              }}
            />
          ) : null}
        </Row>
      )}
    </Column>
  );
}
