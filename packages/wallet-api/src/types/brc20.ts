/**
 * BRC20 token related type definitions
 */

// ========================================
// BRC20 token types
// ========================================

export interface TokenBalance {
  availableBalance: string
  overallBalance: string
  ticker: string
  tickerHex: string
  transferableBalance: string
  availableBalanceSafe: string
  availableBalanceUnSafe: string
  selfMint: boolean
  displayName?: string
  tag?: string
}

export interface TokenInfo {
  totalSupply: string
  totalMinted: string
  decimal: number
  holder: string
  inscriptionId: string
  selfMint?: boolean
  holdersCount: number
  historyCount: number
  logo: string
}

export interface TokenTransfer {
  ticker: string
  amount: string
  inscriptionId: string
  inscriptionNumber: number
  timestamp: number
  confirmations: number
  satoshi: number
}

export interface AddressTokenSummary {
  tokenInfo: TokenInfo
  tokenBalance: TokenBalance
  historyList: TokenTransfer[]
  transferableList: TokenTransfer[]
}

export interface BRC20HistoryItem {
  type: string
  from: string
  to: string
  amount: string
  txid: string
  blocktime: number
}
