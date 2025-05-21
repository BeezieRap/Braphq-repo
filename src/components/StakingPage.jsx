"use client";
import React, { useEffect, useState } from "react";
import {
  useAddress,
  useChain,
  useSwitchChain,
  useContract,
  useOwnedNFTs,
  useContractWrite,
} from "@thirdweb-dev/react";
import Image from "next/image";

// NFT/staking contract addresses must be deployed on Avalanche
const COLLECTIONS = [
  {
    name: "Core Beez",
    nftContractAddress:
      "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
    stakingContractAddress:
      "0xD86965fE1436B01dBD933cE433359D2255F2135D",
    nftType: "nft-collection",
    stakingType: "custom",
  },
  {
    name: "Bad Azz Bumba Beez",
    nftContractAddress:
      "0x7a30231BD80C7F0C5413BA15bb5A2206Fa801c81",
    stakingContractAddress:
      "0x6b391d65f21CA93A39E3B9715C55b320f580aD1a",
    nftType: "nft-collection",
    stakingType: "custom",
  },
];

// Simple error boundary, for demo use only
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  if (error)
    return (
      <div style={{ color: "red", padding: 24 }}>
        <h2>Something went wrong:</h2>
        <pre>{error.message || String(error)}</pre>
      </div>
    );
  return (
    <React.ErrorBoundary
      fallbackRender={({ error }) => {
        setError(error);
        return null;
      }}
    >
      {children}
    </React.ErrorBoundary>
  );
}

export default function StakingPage() {
  const address = useAddress();
  const chain = useChain();
  const switchChain = useSwitchChain();
  const [
    selectedCollectionIndex,
    setSelectedCollectionIndex,
  ] = useState(0);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [rewards, setRewards] = useState("0");
  const [stakeError, setStakeError] = useState("");
  const [loadingStakeData, setLoadingStakeData] =
    useState(false);

  const avalancheChainId = 43114; // For Avalanche C-Chain

  const collection = COLLECTIONS[selectedCollectionIndex];
  const {
    contract: nftContract,
    isLoading: nftContractLoading,
    error: nftError,
  } = useContract(
    collection.nftContractAddress,
    collection.nftType,
  );
  const {
    contract: stakingContract,
    isLoading: stakingLoading,
    error: stakingError,
  } = useContract(
    collection.stakingContractAddress,
    collection.stakingType,
  );

  const {
    data: ownedNFTs,
    isLoading: loadingOwnedNFTs,
    error: ownedNftsError,
  } = useOwnedNFTs(nftContract, address);

  useEffect(() => {
    setStakeError("");
    setLoadingStakeData(true);
    setStakedNFTs([]);
    setRewards("0");
    let stopped = false;
    async function fetchStakeData() {
      if (!stakingContract || !address) {
        setLoadingStakeData(false);
        return;
      }
      try {
        const info = await stakingContract.call(
          "getStakeInfo",
          [address],
        );
        if (!stopped) {
          setStakedNFTs(info?.[0] || []);
          setRewards(info?.[1]?.toString() || "0");
        }
      } catch (err) {
        if (!stopped) {
          setStakeError(
            "Error loading staked NFTs / rewards: " +
              (err?.message || String(err)),
          );
          setStakedNFTs([]);
          setRewards("0");
        }
      } finally {
        setLoadingStakeData(false);
      }
    }
    fetchStakeData();
    return () => {
      stopped = true;
    };
  }, [stakingContract, address]);

  const { mutateAsync: stakeNFT, isLoading: isStaking } =
    useContractWrite(stakingContract, "stake");
  const {
    mutateAsync: withdrawNFT,
    isLoading: isUnstaking,
  } = useContractWrite(stakingContract, "withdraw");
  const {
    mutateAsync: claimRewards,
    isLoading: isClaiming,
  } = useContractWrite(stakingContract, "claimRewards");

  // Actions
  const handleStake = async (tokenId) => {
    setStakeError("");
    if (!stakingContract || !stakeNFT)
      return setStakeError("Staking contract not loaded.");
    try {
      await stakeNFT({ args: [[tokenId]] });
      alert("Staked NFT successfully!");
    } catch (err) {
      setStakeError(
        "Failed to stake NFT: " +
          (err?.message || String(err)),
      );
    }
  };
  const handleUnstake = async (tokenId) => {
    setStakeError("");
    if (!stakingContract || !withdrawNFT)
      return setStakeError("Staking contract not loaded.");
    try {
      await withdrawNFT({ args: [[tokenId]] });
      alert("Unstaked NFT successfully!");
    } catch (err) {
      setStakeError(
        "Failed to unstake NFT: " +
          (err?.message || String(err)),
      );
    }
  };
  const handleClaimRewards = async () => {
    setStakeError("");
    if (!stakingContract || !claimRewards)
      return setStakeError("Staking contract not loaded.");
    try {
      await claimRewards();
      alert("Rewards claimed successfully!");
    } catch (err) {
      setStakeError(
        "Failed to claim rewards: " +
          (err?.message || String(err)),
      );
    }
  };

  // UI: Only works on Avalanche, show switch if not
  if (chain && chain.chainId !== avalancheChainId) {
    return (
      <div style={{ margin: 24 }}>
        <h2>Wrong Network</h2>
        <p>
          This app only works on Avalanche C-Chain. Your
          wallet is connected to: <b>{chain.name}</b>
        </p>
        <button
          onClick={() => switchChain(avalancheChainId)}
        >
          Switch to Avalanche
        </button>
      </div>
    );
  }
  if (!address)
    return <p>Please connect your wallet to stake NFTs.</p>;

  return (
    <ErrorBoundary>
      <div className="staking-page">
        <h1>Multi-Collection NFT Staking</h1>
        <div style={{ marginBottom: "1rem" }}>
          <label>Select Collection: </label>
          <select
            value={selectedCollectionIndex}
            onChange={(e) =>
              setSelectedCollectionIndex(
                Number(e.target.value),
              )
            }
          >
            {COLLECTIONS.map((col, i) => (
              <option
                key={col.nftContractAddress}
                value={i}
              >
                {col.name}
              </option>
            ))}
          </select>
        </div>
        {/* Error and status feedback */}
        {stakeError && (
          <div style={{ color: "red", marginBottom: 8 }}>
            {stakeError}
          </div>
        )}
        {nftError && (
          <div style={{ color: "red", marginBottom: 8 }}>
            NFT contract error: {nftError.message}
          </div>
        )}
        {stakingError && (
          <div style={{ color: "red", marginBottom: 8 }}>
            Staking contract error: {stakingError.message}
          </div>
        )}
        {ownedNftsError && (
          <div style={{ color: "red", marginBottom: 8 }}>
            Error loading NFTs: {ownedNftsError.message}
          </div>
        )}

        {/* Rewards */}
        <div>
          <h2>Rewards Earned: {rewards} BRAP</h2>
          <button
            onClick={handleClaimRewards}
            disabled={isClaiming || !stakingContract}
          >
            {isClaiming ? "Claiming..." : "Claim Rewards"}
          </button>
        </div>

        {/* Owned NFTs */}
        <div>
          <h2>Your NFTs (Available to Stake)</h2>
          {nftContractLoading || loadingOwnedNFTs ? (
            <p>Loading your NFTs...</p>
          ) : null}
          {!loadingOwnedNFTs && ownedNFTs?.length === 0 && (
            <p>No NFTs found in this collection.</p>
          )}
          <div className="nft-grid">
            {ownedNFTs?.map((nft) => (
              <div
                key={nft.metadata.id}
                className="nft-card"
              >
                <Image
                  src={nft.metadata.image}
                  alt={nft.metadata.name}
                  width={150}
                  height={150}
                  style={{
                    borderRadius: "6px",
                    objectFit: "cover",
                  }}
                  unoptimized={true}
                />
                <p>{nft.metadata.name}</p>
                <button
                  onClick={() =>
                    handleStake(nft.metadata.id)
                  }
                  disabled={isStaking || !stakingContract}
                >
                  {isStaking ? "Staking..." : "Stake"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Staked NFTs */}
        <div>
          <h2>Your Staked NFTs</h2>
          {loadingStakeData ? (
            <p>Loading staked NFTs...</p>
          ) : null}
          {stakedNFTs?.length === 0 &&
            !loadingStakeData && (
              <p>
                You have no NFTs staked in this collection.
              </p>
            )}
          <div className="nft-grid">
            {stakedNFTs?.map((tokenId) => (
              <div key={tokenId} className="nft-card">
                <p>Token ID: {tokenId}</p>
                <button
                  onClick={() => handleUnstake(tokenId)}
                  disabled={isUnstaking || !stakingContract}
                >
                  {isUnstaking ? "Unstaking..." : "Unstake"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .staking-page { max-width: 900px; margin: 0 auto; padding: 1rem; }
          .nft-grid { display: flex; flex-wrap: wrap; gap: 1rem; }
          .nft-card { border: 1px solid #ccc; padding: 0.5rem; border-radius: 8px; text-align: center; width: 160px; background-color: #fff; }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}
