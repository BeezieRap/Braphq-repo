export const MARKETPLACE: string = '0x586d90eceDAf6627832f1B6081CAfc4Ea27fAf6A';

export const NFT_COLLECTIONS: string[] = [
  '0x0924319a7524cf023356Ace4D5018fADDE0c60C8',
  '0x317F0FCB1d14C8aaA33F839B43B1aa92845a8145',
  '0xA3DaEd128c483e38984f8374916A441a22CD8aDd'
];

// Use the first NFT collection for components that expect a single contract address
export const NFT_COLLECTION: string = NFT_COLLECTIONS[0] || "";

// Staking contract address
export const STAKING_CONTRACT_ADDRESS: string = '0xD86965fE1436B01dBD933cE433359D2255F2135D';

// Set network to Avalanche C-Chain (43114) — number type is often preferred for network chain IDs
export const NETWORK: number = 43114;
