"use client";

import React, { useState, useEffect } from "react";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
} from "thirdweb";
import {
  ConnectEmbed,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { defineChain } from "thirdweb/chains";

// NFT type definition
interface NFTType {
  tokenId: string | number;
  image: string;
  name?: string;
  collection: string;
  collectionAddress: string;
}

const chain = defineChain(1); // Ethereum Mainnet
const client = createThirdwebClient({
  clientId: "42b826ce4c0853db0413459003bbeff7",
});

// Your contract addresses
const NFT_COLLECTIONS = [
  {
    name: "Bad Azz Bumba Beez",
    address: "0x7a30231BD80C7F0C5413BA15bb5A2206Fa801c81",
  },
  {
    name: "BRAP Music NFBz",
    address: "0x9d29d7C8871C093448113be59505CdA5E88f13f4",
  },
  {
    name: "Core Beez",
    address: "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
  },
];

// Staking contract address (Queen Bee Nectar Tier)
const STAKING_CONTRACT_ADDRESS =
  "0xD86965fE1436B01dBD933cE433359D2255F2135D";

export default function StakingPage() {
  const account = useActiveAccount();
  const [userNFTs, setUserNFTs] = useState<NFTType[]>([]);
  const [staking, setStaking] = useState(false);
  const {
    mutate: sendTx,
    data: txResult,
    isPending: isStaking,
    error,
  } = useSendTransaction();

  useEffect(() => {
    async function fetchNFTs() {
      if (!account) {
        setUserNFTs([]);
        return;
      }

      const ownedNFTs: NFTType[] = [];
      for (const collection of NFT_COLLECTIONS) {
        try {
          const contract = getContract({
            address: collection.address as `0x${string}`,
            chain,
            client,
          });
          // Safely check for erc721.getOwned
          const erc721 = (contract as any).erc721;
          if (
            erc721 &&
            typeof erc721.getOwned === "function"
          ) {
            const tokens = await erc721.getOwned({
              address: account.address as string,
              start: 0,
              count: 50,
            });
            ownedNFTs.push(
              ...tokens.map((nft: any) => ({
                tokenId: nft.tokenId ?? nft.id,
                image: nft.image,
                name: nft.name,
                collection: collection.name,
                collectionAddress: collection.address,
              })),
            );
          }
        } catch (e) {
          // continue to next collection on error
        }
      }
      setUserNFTs(ownedNFTs);
    }
    fetchNFTs();
  }, [account]);

  // Handle staking an NFT
  const handleStake = async (nft: NFTType) => {
    setStaking(true);
    try {
      const stakingContract = getContract({
        address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
        chain,
        client,
      });

      // --- THE IMPORTANT FIX: ENSURE tokenId IS bigint ---
      const tokenIdAsBigInt =
        typeof nft.tokenId === "bigint"
          ? nft.tokenId
          : BigInt(nft.tokenId.toString());

      const stakeTx = prepareContractCall({
        contract: stakingContract,
        method: "function stake(uint256 tokenId)",
        params: [tokenIdAsBigInt],
      });

      await sendTx(stakeTx);

      alert(`NFT ${nft.tokenId} staked!`);
    } catch (e: any) {
      alert(
        "Failed to stake NFT: " + (e?.message || String(e)),
      );
    }
    setStaking(false);
  };

  // Style objects
  const pageStyle = {
    minHeight: "100vh",
    background: "#fff",
    color: "#111",
    fontFamily: "inherit",
    margin: 0,
    padding: 0,
  };
  const cardStyle = {
    border: "2px solid #FFA500",
    borderRadius: "10px",
    padding: "10px",
    minWidth: "180px",
    background: "#fff",
    color: "#111",
    boxShadow: "0 2px 6px rgba(255,165,0,0.05)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  };
  const buttonStyle = {
    marginTop: "12px",
    background: "#FFA500",
    color: "#111",
    border: "none",
    borderRadius: "6px",
    padding: "10px 18px",
    fontWeight: "bold" as const,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(255,165,0,0.10)",
    transition: "background 0.2s",
  };

  return (
    <div style={pageStyle}>
      {/* Your navbar here (update navbar styles if needed) */}
      {!account ? (
        <div style={{ maxWidth: 380, margin: "40px auto" }}>
          <ConnectEmbed client={client} chain={chain} />
        </div>
      ) : (
        <>
          <h1 style={{ color: "#111" }}>Stake your NFTs</h1>
          {userNFTs.length === 0 && (
            <p style={{ color: "#111" }}>
              You don't own any stakeable NFTs from our
              collections yet.
            </p>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              justifyContent: "flex-start",
              marginTop: "18px",
            }}
          >
            {userNFTs.map((nft) => (
              <div
                key={
                  String(nft.tokenId) +
                  nft.collectionAddress
                }
                style={cardStyle}
              >
                <img
                  src={nft.image}
                  alt={nft.name || "NFT"}
                  style={{
                    width: "100%",
                    borderRadius: "6px",
                    border: "1.5px solid #FFA500",
                    marginBottom: 8,
                    background: "#fff6e0",
                  }}
                />
                <b style={{ color: "#111" }}>
                  {nft.name || `NFT #${nft.tokenId}`}
                </b>
                <div style={{ color: "#111" }}>
                  Collection: {nft.collection}
                </div>
                <div style={{ color: "#111" }}>
                  Token ID: {nft.tokenId}
                </div>
                <button
                  style={buttonStyle}
                  disabled={staking || isStaking}
                  onClick={() => handleStake(nft)}
                >
                  {staking || isStaking
                    ? "Staking..."
                    : "Stake"}
                </button>
              </div>
            ))}
          </div>
          {txResult && (
            <div
              style={{
                color: "#111",
                fontWeight: "bold",
                marginTop: "12px",
              }}
            >
              Staking transaction sent! Check your wallet.
            </div>
          )}
          {error && (
            <div
              style={{ color: "#d35400", marginTop: "8px" }}
            >
              Error:{" "}
              {(error as { message?: string })?.message ??
                String(error)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
