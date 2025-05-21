import client from "@/lib/client";
import { getContract } from "thirdweb";
import { avalanche } from "thirdweb/chains";

/**
 * Network your contracts are deployed to.
 */
export const NETWORK = avalanche;

/**
 * Marketplace V3 contract address and contract instance.
 */
export const MARKETPLACE_ADDRESS =
  "0x586d90eceDAf6627832f1B6081CAfc4Ea27fAf6A";
export const MARKETPLACE = getContract({
  address: MARKETPLACE_ADDRESS,
  client,
  chain: NETWORK,
});

/**
 * Bad Azz Bumba Beez NFT Collection and Staking contract
 */
export const BAD_AZZ_BUMBA_BEEZ_COLLECTION_ADDRESS =
  "0x0924319a7524cf023356Ace4D5018fADDE0c60C8";
export const BAD_AZZ_BUMBA_BEEZ_COLLECTION = getContract({
  address: BAD_AZZ_BUMBA_BEEZ_COLLECTION_ADDRESS,
  client,
  chain: NETWORK,
});
export const BAD_AZZ_BUMBA_BEEZ_STAKING_ADDRESS =
  "0x6b391d65f21CA93A39E3B9715C55b320f580aD1a";
export const BAD_AZZ_BUMBA_BEEZ_STAKING = getContract({
  address: BAD_AZZ_BUMBA_BEEZ_STAKING_ADDRESS,
  client,
  chain: NETWORK,
});

/**
 * Betaverse Bumba Beez NFT Collection and Staking contract
 */
export const BETAVERSE_BUMBA_BEEZ_COLLECTION_ADDRESS =
  "0x317F0FCB1d14C8aaA33F839B43B1aa92845a8145";
export const BETAVERSE_BUMBA_BEEZ_COLLECTION = getContract({
  address: BETAVERSE_BUMBA_BEEZ_COLLECTION_ADDRESS,
  client,
  chain: NETWORK,
});
export const BETAVERSE_BUMBA_BEEZ_STAKING_ADDRESS =
  "0xB04fcfe7EB075BaC7040f1f647c12A55FA4FbB0f";
export const BETAVERSE_BUMBA_BEEZ_STAKING = getContract({
  address: BETAVERSE_BUMBA_BEEZ_STAKING_ADDRESS,
  client,
  chain: NETWORK,
});

/**
 * Core Beez NFT Collection and Staking contract
 */
export const CORE_BEEZ_COLLECTION_ADDRESS =
  "0xA3DaEd128c483e38984f8374916A441a22CD8aDd";
export const CORE_BEEZ_COLLECTION = getContract({
  address: CORE_BEEZ_COLLECTION_ADDRESS,
  client,
  chain: NETWORK,
});
export const CORE_BEEZ_STAKING_ADDRESS =
  "0xD86965fE1436B01dBD933cE433359D2255F2135D";
export const CORE_BEEZ_STAKING = getContract({
  address: CORE_BEEZ_STAKING_ADDRESS,
  client,
  chain: NETWORK,
});

/**
 * Universal Reward Token contract (shared)
 */
export const REWARD_TOKEN_ADDRESS =
  "0x5b3Ff4d494E9Ee69eE0f52Ab9656cFfe99D4839E";
export const REWARD_TOKEN = getContract({
  address: REWARD_TOKEN_ADDRESS,
  client,
  chain: NETWORK,
});

/**
 * Avalanche Explorer URL
 */
export const EXPLORER_URL = "https://snowtrace.io";
// At the end of your contracts.ts file add:

export const NFT_COLLECTION = BAD_AZZ_BUMBA_BEEZ_COLLECTION;
export const NFT_COLLECTION_ADDRESS =
  BAD_AZZ_BUMBA_BEEZ_COLLECTION_ADDRESS;
