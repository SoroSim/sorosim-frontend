import type { LedgerEntry } from '../types'

/**
 * Generate sample ledger snapshots for testing and demo purposes
 */

export function generateTokenContractSnapshot(): LedgerEntry[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'Account',
      data: {
        accountId: 'GABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOPQR',
        balance: '100000000000', // 10,000 XLM
        sequence: '12345678',
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'ContractData',
      data: {
        contractId: 'CABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOPQR',
        key: 'BALANCE',
        value: '{"GABC123...": "1000000"}',
        durability: 'Persistent',
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'ContractData',
      data: {
        contractId: 'CABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOPQR',
        key: 'ADMIN',
        value: '"GABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOPQR"',
        durability: 'Persistent',
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'ContractData',
      data: {
        contractId: 'CABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOPQR',
        key: 'METADATA',
        value: '{"name": "MyToken", "symbol": "MTK", "decimals": 7}',
        durability: 'Persistent',
      },
    },
  ]
}

export function generateCounterSnapshot(): LedgerEntry[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'Account',
      data: {
        accountId: 'GDEF456HIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQR',
        balance: '50000000000', // 5,000 XLM
        sequence: '9876543',
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'ContractData',
      data: {
        contractId: 'CDEF456HIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQR',
        key: 'COUNTER',
        value: '42',
        durability: 'Persistent',
      },
    },
  ]
}

export function generateNFTSnapshot(): LedgerEntry[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'Account',
      data: {
        accountId: 'GHIJ789KLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQR',
        balance: '200000000000', // 20,000 XLM
        sequence: '555666',
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'ContractData',
      data: {
        contractId: 'CHIJ789KLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQR',
        key: 'OWNER_1',
        value: '"GHIJ789KLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQR"',
        durability: 'Persistent',
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'ContractData',
      data: {
        contractId: 'CHIJ789KLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQR',
        key: 'METADATA_1',
        value: '{"name": "Cool NFT #1", "image": "ipfs://Qm..."}',
        durability: 'Persistent',
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'Trustline',
      data: {
        accountId: 'GHIJ789KLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQR',
        asset: 'USDC',
        limit: '1000000',
        balance: '50000',
      },
    },
  ]
}

export const SAMPLE_SNAPSHOTS = {
  'Token Contract': generateTokenContractSnapshot,
  'Counter Contract': generateCounterSnapshot,
  'NFT Contract': generateNFTSnapshot,
}
