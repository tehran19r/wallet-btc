import { describe, expect, it, vi } from 'vitest'

import { brc20Utils } from '../src/utils/brc20-utils'
import { amountToSatoshis } from '../src/utils/bitcoin-utils'
import { underline2Camelcase, wait } from '../src/utils'

describe('misc utils', () => {
  it('amountToSatoshis converts btc amount accurately', () => {
    expect(amountToSatoshis('0.00000001')).toBe(1)
    expect(amountToSatoshis(0.12345678)).toBe(12345678)
  })

  it('brc20Utils byte-length checks work with ascii and multibyte chars', () => {
    expect(brc20Utils.is4Byte('ordi')).toBe(true)
    expect(brc20Utils.is5Byte('ordii')).toBe(true)
    expect(brc20Utils.is4Byte('你a')).toBe(true)
    expect(brc20Utils.is5Byte('你ab')).toBe(true)
  })

  it('underline2Camelcase converts snake_case to camelCase style', () => {
    expect(underline2Camelcase('wallet_background_service')).toBe('walletBackgroundService')
  })

  it('wait executes callback after delay', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()

    const p = wait(fn, 500)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    await p

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
