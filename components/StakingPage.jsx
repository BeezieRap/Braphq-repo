"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  useAddress,
  useChain,
  useSwitchChain,
  useContract,
  useOwnedNFTs,
  useContractWrite,
} from "@thirdweb-dev/react";
import { ChainId } from "@thirdweb-dev/sdk";
import { ErrorBoundary } from "react-error-boundary";

const AVALANCHE_CHAIN_ID = ChainId.Avalanche;

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ color: "red", padding: 24 }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message || String(error)}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function StakingPage() {
  const [loadingStakeInfo, setLoadingStakeInfo] = useState(false);
  const [stakeInfo, setStakeInfo] = useState(null);
  const [error, setError] = useState(null);

  const address = useAddress();
  const chain = useChain();
  const switchChain = useSwitchChain();

  const stakingContract = useContract(
    "0xD86965fE1436B01dBD933cE433359D2255F2135D"
  ).contract;
  const nftContract = useContract("0xA3DaEd128c483e38984f8374916A441a22CD8aDd").contract;

  const {
    data: ownedNFTs,
    isLoading: loadingOwnedNFTs,
    error: ownedNftsError,
  } = useOwnedNFTs(nftContract && address ? nftContract : null, address);

  const {
    mutateAsync: stakeNFT,
    isLoading: loadingStake,
    error: stakeError,
  } = useContractWrite(stakingContract, "stake");

  const {
    mutateAsync: unstakeNFT,
    isLoading: loadingUnstake,
    error: unstakeError,
  } = useContractWrite(stakingContract, "unstake");

  useEffect(() => {
    let stopped = false;
    setError(null);
    setLoadingStakeInfo(true);

    async function loadStakeInfo() {
      if (!address || !stakingContract) {
        setLoadingStakeInfo(false);
        return;
      }

      try {
        const info = await stakingContract.call("getStakeInfo", [address]);
        if (!stopped) setStakeInfo(info);
      } catch (e) {
        if (!stopped) setError(e);
      } finally {
        if (!stopped) setLoadingStakeInfo(false);
      }
    }

    loadStakeInfo();

    return () => {
      stopped = true;
    };
  }, [address, stakingContract]);

  if (!address) {
    return (
      <div style={{ padding: 24 }}>
        <p>Please connect your wallet to use the staking page.</p>
      </div>
    );
  }

  if (chain?.id !== AVALANCHE_CHAIN_ID) {
    return (
      <div style={{ padding: 24 }}>
        <p>You need to be connected to the Avalanche network.</p>
        <button
          onClick={() => switchChain(AVALANCHE_CHAIN_ID)}
          disabled={!switchChain}
          style={{
            padding: "8px 16px",
            fontWeight: "bold",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: switchChain ? "pointer" : "not-allowed",
          }}
        >
          Switch to Avalanche
        </button>
      </div>
    );
  }

  async function handleStake(tokenId) {
    setError(null);
    try {
      await stakeNFT({ args: [[tokenId]] });
    } catch (e) {
      setError(e);
    }
  }

  async function handleUnstake(tokenId) {
    setError(null);
    try {
      await unstakeNFT({ args: [[tokenId]] });
    } catch (e) {
      setError(e);
    }
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => setError(null)}
    >
      <main style={{ padding: 24 }}>
        <h1>Beezie Rap Staking</h1>

        {error && (
          <div
            style={{
              backgroundColor: "#fdd",
              border: "1px solid #f99",
              padding: 12,
              marginBottom: 16,
              borderRadius: 4,
            }}
          >
            <strong>Error:</strong> {error.message || String(error)}
          </div>
        )}

        {loadingStakeInfo && <p>Loading staking info...</p>}

        {stakeInfo && (
          <div style={{ marginBottom: 24 }}>
            <h2>Your staking info:</h2>
            <pre
              style={{
                backgroundColor: "#eee",
                padding: 12,
                borderRadius: 4,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(stakeInfo, null, 2)}
            </pre>
          </div>
        )}

        <section>
          <h2>Your NFTs</h2>
          {loadingOwnedNFTs && <p>Loading your NFTs...</p>}
          {ownedNftsError && (
            <p style={{ color: "red" }}>
              Error loading NFTs: {ownedNftsError.message || String(ownedNftsError)}
            </p>
          )}

          {!loadingOwnedNFTs && ownedNFTs?.length === 0 && (
            <p>You don't own any NFTs in this collection.</p>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              marginTop: 16,
            }}
          >
            {ownedNFTs?.map((nft) => {
              const tokenId = nft.metadata.id;
              const imageUrl = nft.metadata.image || "";

              // Check if staked by looking at stakeInfo (if structure known)
              // Assuming stakeInfo.stakedTokens is an array of token IDs
              const isStaked =
                stakeInfo?.stakedTokens &&
                stakeInfo.stakedTokens.includes(tokenId);

              return (
                <div
                  key={tokenId}
                  style={{
                    width: 200,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: 12,
                    textAlign: "center",
                  }}
                >
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={`NFT ${tokenId}`}
                      width={180}
                      height={180}
                      unoptimized
                      style={{ borderRadius: 8 }}
                    />
                  )}
                  <p>Token ID: {tokenId}</p>
                  {isStaked ? (
                    <button
                      onClick={() => handleUnstake(tokenId)}
                      disabled={loadingUnstake}
                      style={{
                        marginTop: 8,
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: 4,
                        cursor: loadingUnstake ? "not-allowed" : "pointer",
                      }}
                    >
                      {loadingUnstake ? "Unstaking..." : "Unstake"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStake(tokenId)}
                      disabled={loadingStake}
                      style={{
                        marginTop: 8,
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: 4,
                        cursor: loadingStake ? "not-allowed" : "pointer",
                      }}
                    >
                      {loadingStake ? "Staking..." : "Stake"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
}
