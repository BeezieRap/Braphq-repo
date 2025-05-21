export const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;

export const NFT_COLLECTIONS = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS
  ? process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS.split(",").map(addr => addr.trim()).filter(addr => addr.length > 0)
  : [];

// Use the first NFT collection for components that expect a single contract
export const NFT_COLLECTION = NFT_COLLECTIONS[0] || "";

// Set network to Avalanche C-Chain (43114)
export const NETWORK = "43114";