import { Buffer } from 'buffer'
import * as encoding from '@cosmjs/encoding'
import { makeSignBytes } from '@cosmjs/proto-signing'
export function sortObjectByKey(obj: Record<string, any>): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectByKey)
  }
  const sortedKeys = Object.keys(obj).sort()
  const result: Record<string, any> = {}
  sortedKeys.forEach(key => {
    result[key] = sortObjectByKey(obj[key])
  })
  return result
}

export function sortedJsonByKeyStringify(obj: Record<string, any>): string {
  return JSON.stringify(sortObjectByKey(obj))
}

export function escapeHTML(str: string): string {
  return str.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

export function serializeSignDoc(signDoc: any): Uint8Array {
  // @ts-ignore
  return Buffer.from(escapeHTML(sortedJsonByKeyStringify(signDoc)))
}

export function makeADR36AminoSignDoc(signer: string, data: string | Uint8Array) {
  if (typeof data === 'string') {
    data = Buffer.from(data).toString('base64')
  } else {
    data = Buffer.from(data).toString('base64')
  }

  return {
    chain_id: '',
    account_number: '0',
    sequence: '0',
    fee: {
      gas: '0',
      amount: [],
    },
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          signer,
          data,
        },
      },
    ],
    memo: '',
  }
}

export function encodeSecp256k1Pubkey(pubkey: Uint8Array): any {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error(
      'Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03'
    )
  }
  return {
    type: 'tendermint/PubKeySecp256k1',
    value: Buffer.from(pubkey).toString('base64'),
  }
}

export function encodeSecp256k1Signature(pubkey: Uint8Array, signature: Uint8Array): any {
  if (signature.length !== 64) {
    throw new Error(
      'Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.'
    )
  }

  return {
    pub_key: encodeSecp256k1Pubkey(pubkey),
    signature: Buffer.from(signature).toString('base64'),
  }
}

export const objToUint8Array = (obj: any) => {
  const arr: number[] = []
  for (const id in obj) {
    arr[parseInt(id)] = obj[id]
  }
  return Uint8Array.from(arr)
}

export function directSignDocToBytesHex(signDoc: any): string {
  signDoc.bodyBytes = objToUint8Array(signDoc.bodyBytes)
  signDoc.authInfoBytes = objToUint8Array(signDoc.authInfoBytes)
  const signBytes = makeSignBytes(signDoc)
  return encoding.toHex(signBytes)
}

export function arbitrarySignDocToBytesHex(signerAddress: string, data: any): string {
  const signDoc = makeADR36AminoSignDoc(signerAddress, data)
  const signBytes = serializeSignDoc(signDoc)
  return encoding.toHex(signBytes)
}

export function encodeSignature(publicKey: string, signature: string) {
  return encodeSecp256k1Signature(encoding.fromHex(publicKey), encoding.fromHex(signature))
}
