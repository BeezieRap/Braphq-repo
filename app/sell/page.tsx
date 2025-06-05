"use client";
import React, { useState, useEffect } from "react";
import {
  createThirdwebClient,
  getContract,
  sendTransaction,
  defineChain,
} from "thirdweb";
import {
  ConnectEmbed,
  useActiveAccount,
} from "thirdweb/react";
import { createListing } from "thirdweb/extensions/marketplace";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

// --- NFT Type ---
interface NFTType {
  tokenId: string;
  image?: string;
  name?: string;
  collection: string;
  collectionAddress: string;
  stakingContractAddress: string;
}

// --- Chain & Client Setup ---
const chain = defineChain(43114); // Avalanche C-Chain
const client = createThirdwebClient({
  clientId: "42b826ce4c0853db0413459003bbeff7",
});

// --- Your NFT Collections ---
const NFT_COLLECTIONS = [
  {
    name: "Bad Azz Bumba Beez",
    address: "0x7a30231BD80C7F0C5413BA15bb5A2206Fa801c81",
    stakingContractAddress: "0x6b391d65f21CA93A39E3B9715C55b320f580aD1a",
  },
  {
    name: "Betaverse Bumba Beez",
    address: "0x317F0FCB1d14C8aaA33F839B43B1aa92845a8145",
    stakingContractAddress: "0xB04fcfe7EB075BaC7040f1f647c12A55FA4FbB0f",
  },
  {
    name: "Core Bumba Beez",
    address: "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
    stakingContractAddress: "0xD86965fE1436B01dBD933cE433359D2255F2135D",
  },
];

// --- Marketplace contract address ---
const MARKETPLACE_CONTRACT_ADDRESS =
  "0x586d90eceDAf6627832f1B6081CAfc4Ea27fAf6A";

// --- BRAP Token Address ---
const BRAP_TOKEN_ADDRESS =
  "0x5b3Ff4d494E9Ee69eE0f52Ab9656cFfe99D4839E";

// --- ERC721 ABI for reading NFTs ---
const erc721Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

// --- Helper to fetch NFT metadata ---
async function fetchMetadata(url: string) {
  if (!url) return {};
  if (url.startsWith("ipfs://"))
    url = url.replace("ipfs://", "https://ipfs.io/ipfs/");
  try {
    const res = await fetch(url);
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}

// --- Reusable function to fetch user's NFTs from your collections ---
async function fetchUserNFTs(address: string): Promise<NFTType[]> {
  const provider = new JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");
  let owned: NFTType[] = [];
  for (const coll of NFT_COLLECTIONS) {
    try {
      const contract = new ethers.Contract(coll.address, erc721Abi, provider);
      const balanceRaw = await contract.balanceOf(address);
      const balance = Number(balanceRaw);
      for (let i = 0; i < balance; i++) {
        const tokenIdRaw = await contract.tokenOfOwnerByIndex(address, i);
        const tokenId = tokenIdRaw.toString();
        let image, name;
        try {
          const tokenUri = await contract.tokenURI(tokenId);
          const meta = await fetchMetadata(tokenUri);
          let imgUrl = meta.image;
          if (
            imgUrl &&
            typeof imgUrl === "string" &&
            imgUrl.startsWith("ipfs://")
          ) {
            imgUrl = imgUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
          }
          image = imgUrl;
          name = meta.name;
        } catch {}
        owned.push({
          tokenId,
          image,
          name,
          collection: coll.name,
          collectionAddress: coll.address,
          stakingContractAddress: coll.stakingContractAddress,
        });
      }
    } catch {}
  }
  return owned;
}

// --- Sell Page Component ---
export default function SellPage() {
  const account = useActiveAccount();
  const [userNFTs, setUserNFTs] = useState<NFTType[]>([]);
  const [loading, setLoading] = useState(false);
  const [listingPrice, setListingPrice] = useState<{ [key: string]: string }>({});
  const [listingStatus, setListingStatus] = useState<{ [key: string]: string }>({});
  const [brapToAvax, setBrapToAvax] = useState<string>("0.00007332534799");

  useEffect(() => {
    let cancelled = false;
    async function loadNFTs() {
      if (!account?.address) {
        setUserNFTs([]);
        return;
      }
      setLoading(true);
      const nfts = await fetchUserNFTs(account.address);
      if (!cancelled) setUserNFTs(nfts);
      setLoading(false);
    }
    loadNFTs();
    return () => {
      cancelled = true;
    };
  }, [account]);

  async function handleListNFT(nft: NFTType) {
    if (!account?.address) return;
    const key = `${nft.collectionAddress}-${nft.tokenId}`;
    const price = listingPrice[key];
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setListingStatus((prev) => ({
        ...prev,
        [key]: "Enter a valid price.",
      }));
      return;
    }
    setListingStatus((prev) => ({
      ...prev,
      [key]: "Listing...",
    }));
    try {
      const marketplace = getContract({
        address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        chain,
        client,
      });
      const transaction = createListing({
        contract: marketplace,
        assetContractAddress: nft.collectionAddress,
        tokenId: BigInt(nft.tokenId),
        pricePerToken: price,
        currencyContractAddress: BRAP_TOKEN_ADDRESS,
      });
      await sendTransaction({ transaction, account });
      setListingStatus((prev) => ({
        ...prev,
        [key]: "Listed successfully!",
      }));
    } catch (err: any) {
      setListingStatus((prev) => ({
        ...prev,
        [key]: "Listing failed.",
      }));
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "inherit" }}>
      {!account ? (
        <div style={{
          maxWidth: 380,
          margin: "40px auto",
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 2px 12px rgba(255,165,0,0.06)",
          padding: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <ConnectEmbed
            client={client}
            chain={chain}
            theme="light"
            style={{
              background: "#fff",
              color: "#111",
              borderRadius: "10px",
              width: "100%",
              boxShadow: "none",
            }}
            modalSize="compact"
          />
        </div>
      ) : (
        <>
          <h1 style={{ color: "#111" }}>Jeet Your Bumba Beez den prick!</h1>
          <p style={{ color: "#888", marginTop: "-8px" }}>
            1 BRAPTKN = {brapToAvax} AVAX
          </p>
          {loading ? (
            <p style={{ color: "#FFA500" }}>Loading your NFTs...</p>
          ) : userNFTs.length === 0 ? (
            <p style={{ color: "#111" }}>
              You aint got no Bumba Beez fam what are you on?
            </p>
          ) : (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              justifyContent: "flex-start",
              marginTop: "18px",
            }}>
              {userNFTs.map((nft) => {
                const key = `${nft.collectionAddress}-${nft.tokenId}`;
                return (
                  <div key={key} style={{
                    border: "2px solid #FFA500",
                    borderRadius: "10px",
                    padding: "10px",
                    minWidth: "180px",
                    background: "#fff",
                    color: "#111",
                    boxShadow: "0 2px 6px rgba(255,165,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}>
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name || "NFT"}
                        style={{
                          width: "100%",
                          borderRadius: "6px",
                          border: "1.5px solid #FFA500",
                          marginBottom: 8,
                          background: "#fff6e0",
                          objectFit: "cover",
                          minHeight: 180,
                          maxHeight: 220,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/220x180?text=No+Image";
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: 180,
                        borderRadius: "6px",
                        border: "1.5px solid #FFA500",
                        marginBottom: 8,
                        background: "#fff6e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                        fontWeight: "bold",
                      }}>
                        No Image
                      </div>
                    )}
                    <b style={{ color: "#111" }}>
                      {nft.name || `NFT #${nft.tokenId}`}
                    </b>
                    <div style={{ color: "#111" }}>Collection: {nft.collection}</div>
                    <div style={{ color: "#111" }}>Token ID: {nft.tokenId}</div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Price (BRAP)"
                      value={listingPrice[key] || ""}
                      onChange={(e) =>
                        setListingPrice((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      style={{
                        margin: "8px 0",
                        padding: "6px",
                        borderRadius: "4px",
                        border: "1px solid #FFA500",
                        width: "100%",
                      }}
                    />
                    <button
                      style={{
                        background: "#FFA500",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px 0",
                        fontWeight: "bold",
                        width: "100%",
                        margin: "6px 0",
                        cursor: "pointer",
                      }}
                      onClick={() => handleListNFT(nft)}
                    >
                      Sell
                    </button>
                    {listingStatus[key] && (
                      <div style={{ color: "#FFA500", marginTop: 4 }}>
                        {listingStatus[key]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
