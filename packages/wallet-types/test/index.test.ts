import { describe, expect, it } from 'vitest'

import { AddressType, ChainType, NetworkType } from '../src'

describe('wallet-types enums', () => {
  it('NetworkType keeps stable numeric values', () => {
    expect(NetworkType.MAINNET).toBe(0)
    expect(NetworkType.TESTNET).toBe(1)
    expect(NetworkType.REGTEST).toBe(2)

    // reverse mapping for numeric enum
    expect(NetworkType[0]).toBe('MAINNET')
    expect(NetworkType[1]).toBe('TESTNET')
    expect(NetworkType[2]).toBe('REGTEST')
  })

  it('ChainType keeps stable string literals', () => {
    expect(ChainType.BITCOIN_MAINNET).toBe('BITCOIN_MAINNET')
    expect(ChainType.BITCOIN_TESTNET).toBe('BITCOIN_TESTNET')
    expect(ChainType.BITCOIN_TESTNET4).toBe('BITCOIN_TESTNET4')
    expect(ChainType.BITCOIN_SIGNET).toBe('BITCOIN_SIGNET')
    expect(ChainType.FRACTAL_BITCOIN_MAINNET).toBe('FRACTAL_BITCOIN_MAINNET')
    expect(ChainType.FRACTAL_BITCOIN_TESTNET).toBe('FRACTAL_BITCOIN_TESTNET')
  })

  it('AddressType keeps stable numeric ordering and reverse mapping', () => {
    expect(AddressType.P2PKH).toBe(0)
    expect(AddressType.P2WPKH).toBe(1)
    expect(AddressType.P2TR).toBe(2)
    expect(AddressType.P2SH_P2WPKH).toBe(3)
    expect(AddressType.M44_P2WPKH).toBe(4)
    expect(AddressType.M44_P2TR).toBe(5)
    expect(AddressType.P2WSH).toBe(6)
    expect(AddressType.P2SH).toBe(7)
    expect(AddressType.UNKNOWN).toBe(8)

    expect(AddressType[AddressType.P2TR]).toBe('P2TR')
    expect(AddressType[AddressType.UNKNOWN]).toBe('UNKNOWN')
  })

  it('enum values are unique to avoid serialization ambiguity', () => {
    const chainValues = Object.values(ChainType)
    expect(new Set(chainValues).size).toBe(chainValues.length)

    const addressNumericValues = Object.values(AddressType).filter(v => typeof v === 'number')
    expect(new Set(addressNumericValues).size).toBe(addressNumericValues.length)
  })
})
