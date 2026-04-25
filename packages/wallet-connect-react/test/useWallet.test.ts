import { afterEach, describe, expect, it, vi } from 'vitest'
import { useContext } from 'react'

import { useWallet } from '../src/WalletProvider'

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useContext: vi.fn(),
  }
})

describe('useWallet', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('throws when context is empty', () => {
    vi.mocked(useContext).mockReturnValue({} as any)

    expect(() => useWallet()).toThrow('useWallet must be used within a WalletProvider')
  })

  it('returns context when available', () => {
    const context = {
      account: { address: 'bc1qabc', pubKey: 'pubkey' },
      wallet: { config: { type: 'unisat' } },
      isConnecting: false,
      isInitialized: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
      signPsbt: vi.fn(),
      signPsbts: vi.fn(),
      signMessage: vi.fn(),
      supportedWallets: [],
    }

    vi.mocked(useContext).mockReturnValue(context as any)

    expect(useWallet()).toBe(context)
  })
})
