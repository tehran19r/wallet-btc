import ecc from '@bitcoinerlab/secp256k1'
import * as bitcoin from 'bitcoinjs-lib'
import ECPairModule from 'ecpair'
// import * as ecc from 'tiny-secp256k1'
bitcoin.initEccLib(ecc)
//@ts-ignore
const ECPair = (ECPairModule.default ? ECPairModule.default : ECPairModule)(ecc)

export type { ECPairInterface } from 'ecpair'
export { ECPair, bitcoin, ecc }
