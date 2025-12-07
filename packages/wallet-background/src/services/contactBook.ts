import { ChainType } from '@unisat/wallet-types'
import { ContactBookService } from '@unisat/contact-book'

// Export interfaces for compatibility
export interface ContactBookItem {
  name: string
  address: string
  chain: ChainType
  isAlias: boolean
  isContact: boolean
  sortIndex?: number
}

export interface UIContactBookItem {
  name: string
  address: string
}

const contactBookService = new ContactBookService()

export default contactBookService
