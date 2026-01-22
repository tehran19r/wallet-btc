import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { colors } from '@/ui/theme/colors';
import { showLongNumber } from '@/ui/utils';
import { BRC20SingleStepKey, useBRC20SingleStepScreenLogic } from '@unisat/wallet-state';

import { SignPsbt } from '../Approval/components';

export default function BRC20SingleStepScreen() {
  const {
    // data
    signPsbtParamsStep2,
    signPsbtParamsStep3,

    availableBalance,
    tokenBalance,
    tokenInfo,
    inputAmount,
    setInputAmount,
    disabled,
    error,
    toInfo,
    setToInfo,

    // state
    step,

    // actions
    onClickBack,
    onClickConfirmStep1,
    onClickConfirmStep2,
    onClickConfirmStep3,

    // utils
    t,
    tools
  } = useBRC20SingleStepScreenLogic();

  if (step == BRC20SingleStepKey.STEP2) {
    return (
      <SignPsbt
        key={BRC20SingleStepKey.STEP2}
        header={<Header title={t('step_12')} onBack={onClickBack} />}
        params={signPsbtParamsStep2}
        handleCancel={onClickBack}
        handleConfirm={onClickConfirmStep2}
      />
    );
  } else if (step == BRC20SingleStepKey.STEP3) {
    return (
      <SignPsbt
        key={BRC20SingleStepKey.STEP3}
        header={<Header title={t('step_22')} onBack={onClickBack} />}
        params={signPsbtParamsStep3}
        handleCancel={onClickBack}
        handleConfirm={onClickConfirmStep3}
      />
    );
  }

  return (
    <Layout>
      <Header onBack={onClickBack} title={t('send')} />
      <Content>
        <Row justifyCenter>
          <Text
            text={`${showLongNumber(tokenBalance.overallBalance)} ${tokenBalance.ticker}`}
            preset="bold"
            textCenter
            size="xxl"
            wrap
          />
        </Row>

        <Column mt="lg">
          <Input
            preset="address"
            addressInputData={toInfo}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
            recipientLabel={<Text text={t('recipient')} preset="regular" color="textDim" />}
            autoFocus={true}
          />
        </Column>

        <Column mt="lg">
          <Row justifyBetween style={{ alignItems: 'flex-start' }}>
            <Text text={t('balance')} color="textDim" />
            <TickUsdWithoutPrice tick={tokenBalance.ticker} balance={inputAmount} type={TokenType.BRC20} />
            <Row
              style={{ alignItems: 'flex-start' }}
              onClick={() => {
                setInputAmount(availableBalance);
              }}>
              <Text text={t('max')} color="textDim" size="sm" style={{ color: colors.white_muted }} />
              <Text text={`${showLongNumber(availableBalance)} ${tokenBalance.ticker}`} preset="bold" size="sm" wrap />
            </Row>
          </Row>

          <Input
            preset="amount"
            placeholder={t('amount')}
            value={inputAmount.toString()}
            onAmountInputChange={(amount) => {
              setInputAmount(amount);
            }}
            runesDecimal={tokenInfo.decimal}
          />
        </Column>

        <Column mt="lg">
          <FeeRateBar />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button disabled={disabled} preset="primary" text={t('next')} onClick={onClickConfirmStep1}></Button>
      </Content>
    </Layout>
  );
}
