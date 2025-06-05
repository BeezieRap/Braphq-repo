"use client";
import React, { useState, useEffect } from "react";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  resolveMethod,
} from "thirdweb";
import {
  ConnectEmbed,
  useActiveAccount,
  useWalletBalance,
  useSendTransaction,
} from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { setApprovalForAll } from "thirdweb/extensions/erc721";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

interface NFTType {
  tokenId: string;
  image?: string;
  name?: string;
  collection: string;
  collectionAddress: string;
  stakingContractAddress: string;
}

const chain = defineChain(43114); // Avalanche C-Chain

const client = createThirdwebClient({
  clientId: "42b826ce4c0853db0413459003bbeff7",
});

const BRAP_TOKEN_ADDRESS =
  "0x5b3Ff4d494E9Ee69eE0f52Ab9656cFfe99D4839E";

const NFT_COLLECTIONS = [
  {
    name: "Bad Azz Bumba Beez",
    address: "0x7a30231BD80C7F0C5413BA15bb5A2206Fa801c81",
    stakingContractAddress:
      "0x6b391d65f21CA93A39E3B9715C55b320f580aD1a",
  },
  {
    name: "Betaverse Bumba Beez",
    address: "0x317F0FCB1d14C8aaA33F839B43B1aa92845a8145",
    stakingContractAddress:
      "0xB04fcfe7EB075BaC7040f1f647c12A55FA4FbB0f",
  },
  {
    name: "Core Bumba Beez",
    address: "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
    stakingContractAddress:
      "0xD86965fE1436B01dBD933cE433359D2255F2135D",
  },
];

const erc721Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const stakingAbi = [
  "function getStakeInfo(address) view returns (uint256[] tokenIds, uint256 totalRewards)",
];

// Formatting helper for reward tokens using decimals
function formatTokenAmount(
  amount: string,
  decimals: number,
) {
  if (!amount || isNaN(Number(amount))) return "0";
  const amt = BigInt(amount);
  if (decimals === 0) return amt.toString();
  // Show up to 6 decimals, remove trailing zeros
  const whole = amt / BigInt(10 ** decimals);
  const fraction = amt % BigInt(10 ** decimals);
  let fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .slice(0, 6);
  fractionStr = fractionStr.replace(/0+$/, "");
  return fractionStr
    ? `${whole.toString()}.${fractionStr}`
    : whole.toString();
}

// Helper to fetch decimals for a token address
async function fetchTokenDecimals(tokenAddress: string) {
  try {
    const erc20abi = [
      "function decimals() view returns (uint8)",
    ];
    const provider = new JsonRpcProvider(
      "https://api.avax.network/ext/bc/C/rpc",
    );
    const contract = new ethers.Contract(
      tokenAddress,
      erc20abi,
      provider,
    );
    return await contract.decimals();
  } catch {
    return 18; // default to 18 if error
  }
}

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

const fetchTotalRewardsForStaker = async (
  accountAddress: string,
  stakingContractAddress: string,
): Promise<string> => {
  if (!accountAddress || !stakingContractAddress)
    return "0";
  try {
    const provider = new JsonRpcProvider(
      "https://api.avax.network/ext/bc/C/rpc",
    );
    const stakingContract = new ethers.Contract(
      stakingContractAddress,
      stakingAbi,
      provider,
    );
    const result =
      await stakingContract.getStakeInfo(accountAddress);
    return result[1]?.toString() ?? "0";
  } catch {
    return "0";
  }
};

export default function StakingPage() {
  const account = useActiveAccount();
  const [userNFTs, setUserNFTs] = useState<NFTType[]>([]);
  const [stakedNFTs, setStakedNFTs] = useState<NFTType[]>(
    [],
  );
  const [confirmation, setConfirmation] = useState<
    string | null
  >(null);
  const [vaultRewards, setVaultRewards] = useState<{
    [stakingContract: string]: string;
  }>({});
  const [vaultRewardDecimals, setVaultRewardDecimals] =
    useState<{
      [stakingContract: string]: number;
    }>({});
  const sendTx = useSendTransaction();

  const { data: brapBalance, isLoading: brapLoading } =
    useWalletBalance({
      address: account?.address,
      chain,
      client,
      tokenAddress: BRAP_TOKEN_ADDRESS,
    });

  const nftKey = (nft: NFTType) =>
    `${nft.collectionAddress}-${nft.tokenId}`;

  // Fetch user's unstaked NFTs
  useEffect(() => {
    const currentAccount = account;
    if (!currentAccount?.address) {
      setUserNFTs([]);
      return;
    }
    let cancelled = false;
    async function fetchAllOwnedNFTs() {
      if (!currentAccount?.address) return;
      const provider = new JsonRpcProvider(
        "https://api.avax.network/ext/bc/C/rpc",
      );
      let owned: NFTType[] = [];
      for (const coll of NFT_COLLECTIONS) {
        try {
          const contract = new ethers.Contract(
            coll.address,
            erc721Abi,
            provider,
          );
          const balanceRaw = await contract.balanceOf(
            currentAccount.address,
          );
          const balance = Number(balanceRaw);
          for (let i = 0; i < balance; i++) {
            const tokenIdRaw =
              await contract.tokenOfOwnerByIndex(
                currentAccount.address,
                i,
              );
            const tokenId = tokenIdRaw.toString();
            let image, name;
            try {
              const tokenUri =
                await contract.tokenURI(tokenId);
              const meta = await fetchMetadata(tokenUri);
              let imgUrl = meta.image;
              if (
                imgUrl &&
                typeof imgUrl === "string" &&
                imgUrl.startsWith("ipfs://")
              ) {
                imgUrl = imgUrl.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/",
                );
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
              stakingContractAddress:
                coll.stakingContractAddress,
            });
          }
        } catch {}
      }
      if (!cancelled) setUserNFTs(owned);
    }
    fetchAllOwnedNFTs();
    return () => {
      cancelled = true;
    };
  }, [account]);

  // Fetch user's staked NFTs across all staking vaults
useEffect(() => {
  if (!account?.address) {
    setStakedNFTs([]);
    return;
  }

  const userAddress = account.address; // ✅ capture a defined address here

  let cancelled = false;
  async function fetchAllStakedNFTs() {
    const provider = new JsonRpcProvider(
      "https://api.avax.network/ext/bc/C/rpc",
    );
    let stakedAll: NFTType[] = [];
    for (const coll of NFT_COLLECTIONS) {
      try {
        const stakingContract = new ethers.Contract(
          coll.stakingContractAddress,
          stakingAbi,
          provider,
        );
        const nftContract = new ethers.Contract(
          coll.address,
          erc721Abi,
          provider,
        );
        const result = await stakingContract.getStakeInfo(userAddress);
        const tokenIds = Array.isArray(result[0])
          ? result[0]
          : result.tokenIds ?? [];
        for (const id of tokenIds) {
          const tokenId = id.toString();
          let image: string | undefined;
          let name: string | undefined;
          try {
            let tokenUri = await nftContract.tokenURI(tokenId);
            if (tokenUri.startsWith("ipfs://")) {
              tokenUri = tokenUri.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/",
              );
            }
            const meta = await fetchMetadata(tokenUri);
            image = meta.image?.startsWith("ipfs://")
              ? meta.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : meta.image;
            name = meta.name;
          } catch (err) {
            console.error(`Metadata fetch error for token ${tokenId}`, err);
          }
          stakedAll.push({
            tokenId,
            image,
            name,
            collection: coll.name,
            collectionAddress: coll.address,
            stakingContractAddress: coll.stakingContractAddress,
          });
        }
      } catch (err) {
        console.error("Error fetching staked NFTs from contract", err);
      }
    }
    if (!cancelled) setStakedNFTs(stakedAll);
  }
  fetchAllStakedNFTs();
  return () => {
    cancelled = true;
  };
}, [account]);

  // Fetch total reward per staking contract for the user
useEffect(() => {
  if (!account?.address) {
    setVaultRewards({});
    return;
  }

  const userAddress = account.address; // ✅ Fix for TS error

  let cancelled = false;
  async function fetchAllVaultRewards() {
    const rewardsObj: { [key: string]: string } = {};
    for (const coll of NFT_COLLECTIONS) {
      try {
        rewardsObj[coll.stakingContractAddress] =
          await fetchTotalRewardsForStaker(
            userAddress,
            coll.stakingContractAddress,
          );
      } catch {
        rewardsObj[coll.stakingContractAddress] = "0";
      }
    }
    if (!cancelled) setVaultRewards(rewardsObj);
  }

  fetchAllVaultRewards();
  return () => {
    cancelled = true;
  };
}, [account, stakedNFTs]);

  // Fetch decimals for each reward token per vault
  useEffect(() => {
    async function fetchAllDecimals() {
      const decObj: { [key: string]: number } = {};
      for (const coll of NFT_COLLECTIONS) {
        try {
          const stakingAbiMinimal = [
            "function rewardToken() view returns (address)",
          ];
          const provider = new JsonRpcProvider(
            "https://api.avax.network/ext/bc/C/rpc",
          );
          const stakingContract = new ethers.Contract(
            coll.stakingContractAddress,
            stakingAbiMinimal,
            provider,
          );
          const rewardToken =
            await stakingContract.rewardToken();
          decObj[coll.stakingContractAddress] =
            await fetchTokenDecimals(rewardToken);
        } catch {
          decObj[coll.stakingContractAddress] = 18; // fallback to 18
        }
      }
      setVaultRewardDecimals(decObj);
    }
    fetchAllDecimals();
  }, []);

  useEffect(() => {
    if (confirmation) {
      const timer = setTimeout(
        () => setConfirmation(null),
        4000,
      );
      return () => clearTimeout(timer);
    }
  }, [confirmation]);

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
  const connectWrapper = {
    maxWidth: 380,
    margin: "40px auto",
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(255,165,0,0.06)",
    padding: 24,
    display: "flex",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  const actionButtonStyle: React.CSSProperties = {
    background: "#FFA500",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 0",
    fontWeight: "bold",
    width: "100%",
    margin: "6px 0",
    transition: "background 0.2s",
    cursor: "pointer",
  };
  const actionButtonHoverStyle: React.CSSProperties = {
    background: "#cc8400",
  };
  const actionButtonDisabledStyle: React.CSSProperties = {
    background: "#ffe0a3",
    color: "#fff",
    cursor: "not-allowed",
    opacity: 0.7,
  };

  const getNftContract = (nft: NFTType) =>
    getContract({
      address: nft.collectionAddress as `0x${string}`,
      chain,
      client,
    });

  const getStakingContract = (nft: NFTType) =>
    getContract({
      address: nft.stakingContractAddress as `0x${string}`,
      chain,
      client,
    });

  // Transactional buttons, styled
  const StyledTransactionButton = ({
    children,
    disabled,
    ...props
  }: any) => {
    const [hover, setHover] = useState(false);
    return (
      <button
        {...props}
        disabled={disabled}
        style={{
          ...actionButtonStyle,
          ...(hover && !disabled
            ? actionButtonHoverStyle
            : {}),
          ...(disabled ? actionButtonDisabledStyle : {}),
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </button>
    );
  };

  // Group staked NFTs by vault/contract
  const stakedNFTsByVault: { [vault: string]: NFTType[] } =
    {};
  stakedNFTs.forEach((nft) => {
    if (!stakedNFTsByVault[nft.stakingContractAddress])
      stakedNFTsByVault[nft.stakingContractAddress] = [];
    stakedNFTsByVault[nft.stakingContractAddress].push(nft);
  });

  // --- FIXED: Claim all rewards for a vault (per user, per vault) ---
  function handleClaimAllRewardsForVault(vault: string) {
    if (!account?.address) return;
    const contract = getContract({
      address: vault as `0x${string}`,
      chain,
      client,
    });
    const txReq = prepareContractCall({
      contract,
      method: "function claimRewards()",
      params: [],
    });
    sendTx.mutate(txReq, {
      onSuccess: async () => {
        setConfirmation(
          `Rewards claimed for all your NFTs in this vault!`,
        );
        const rewardNew = await fetchTotalRewardsForStaker(
          account.address!,
          vault,
        );
        setVaultRewards((prev) => ({
          ...prev,
          [vault]: rewardNew,
        }));
      },
      onError: (error) => {
        console.error("Claim error:", error);
        setConfirmation(
          `Failed to claim rewards for this vault.`,
        );
      },
    });
  }

  // Unstake NFT and update local data after
  function handleUnstakeNFT(nft: NFTType) {
    const contract = getContract({
      address: nft.stakingContractAddress as `0x${string}`,
      chain,
      client,
    });
    const txReq = prepareContractCall({
      contract,
      method: resolveMethod("withdraw"),
      params: [[BigInt(nft.tokenId)]],
    });
    sendTx.mutate(txReq, {
      onSuccess: async () => {
        setConfirmation(
          `NFT #${nft.tokenId} successfully unstaked!`,
        );
        setStakedNFTs((prev) =>
          prev.filter(
            (item) =>
              !(
                item.tokenId === nft.tokenId &&
                item.collectionAddress ===
                  nft.collectionAddress
              ),
          ),
        );
        setUserNFTs((prev) => [...prev, nft]);
        if (account?.address) {
          const rewardNew =
            await fetchTotalRewardsForStaker(
              account.address,
              nft.stakingContractAddress,
            );
          setVaultRewards((prev) => ({
            ...prev,
            [nft.stakingContractAddress]: rewardNew,
          }));
        }
      },
      onError: () => {
        setConfirmation("Failed to unstake NFT.");
      },
    });
  }

  // Approval using correct PreparedTransaction handling
  function handleApproval(nft: NFTType) {
    const contract = getNftContract(nft);
    const txReq = setApprovalForAll({
      contract: contract,
      operator: nft.stakingContractAddress,
      approved: true,
    });

    sendTx.mutate(txReq, {
      onSuccess: () => {
        setConfirmation(
          `Approved staking contract for ${nft.collection} NFTs!`,
        );
      },
      onError: () => {
        setConfirmation("Approval failed.");
      },
    });
  }

  function handleStake(nft: NFTType) {
    const contract = getStakingContract(nft);
    const txReq = prepareContractCall({
      contract,
      method: resolveMethod("stake"),
      params: [[BigInt(nft.tokenId)]],
    });
    sendTx.mutate(txReq, {
      onSuccess: async () => {
        setConfirmation(
          `NFT #${nft.tokenId} successfully staked!`,
        );
        setUserNFTs((prev) =>
          prev.filter(
            (item) =>
              !(
                item.tokenId === nft.tokenId &&
                item.collectionAddress ===
                  nft.collectionAddress
              ),
          ),
        );
        setStakedNFTs((prev) => [...prev, nft]);
        if (account?.address) {
          const rewardNew =
            await fetchTotalRewardsForStaker(
              account.address,
              nft.stakingContractAddress,
            );
          setVaultRewards((prev) => ({
            ...prev,
            [nft.stakingContractAddress]: rewardNew,
          }));
        }
      },
      onError: () => {
        setConfirmation("Staking failed.");
      },
    });
  }

  return (
    <div style={pageStyle}>
      {confirmation && (
        <div
          style={{
            background: "#FFA500",
            color: "#fff",
            padding: "16px 24px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 18,
            margin: "24px auto",
            maxWidth: 480,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(255,165,0,0.10)",
            zIndex: 100,
          }}
        >
          {confirmation}
        </div>
      )}

      {!account ? (
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
      ) : (
        <>
          <h1 style={{ color: "#111" }}>
            Stake your BUMBA BEEZ
          </h1>
          <div
            style={{
              marginBottom: 24,
              color: "#FFA500",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            {brapLoading
              ? "Loading BRAP balance..."
              : brapBalance
                ? `BRAP Balance: ${brapBalance.displayValue} ${brapBalance.symbol}`
                : "BRAP Balance: 0"}
          </div>
          {Object.keys(stakedNFTsByVault).length > 0 && (
            <div style={{ marginBottom: 32 }}>
              {Object.entries(stakedNFTsByVault).map(
                ([vault, nfts]) => (
                  <div
                    key={vault}
                    style={{ marginBottom: 40 }}
                  >
                    <h2 style={{ color: "#FFA500" }}>
                      Your Staked BUMBA BEEZ (
                      {NFT_COLLECTIONS.find(
                        (c) =>
                          c.stakingContractAddress ===
                          vault,
                      )?.name || vault}
                      )
                    </h2>
                    {/* --- CLAIM BUTTON PER VAULT --- */}
                    <div style={{ marginBottom: 12 }}>
                      <StyledTransactionButton
                        disabled={
                          !vaultRewards[vault] ||
                          vaultRewards[vault] === "0"
                        }
                        onClick={() =>
                          handleClaimAllRewardsForVault(
                            vault,
                          )
                        }
                      >
                        Claim{" "}
                        {formatTokenAmount(
                          vaultRewards[vault] || "0",
                          vaultRewardDecimals[vault] || 18,
                        )}{" "}
                        $BRAPTKN
                      </StyledTransactionButton>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "24px",
                        justifyContent: "flex-start",
                        marginTop: "18px",
                      }}
                    >
                      {nfts.map((nft) => (
                        <div
                          key={nftKey(nft)}
                          style={cardStyle}
                        >
                          {nft.image ? (
                            <img
                              src={nft.image}
                              alt={nft.name || "NFT"}
                              style={{
                                width: "100%",
                                borderRadius: "6px",
                                border:
                                  "1.5px solid #FFA500",
                                marginBottom: 8,
                                background: "#fff6e0",
                                objectFit: "cover",
                                minHeight: 180,
                                maxHeight: 220,
                              }}
                              onError={(e) => {
                                (
                                  e.target as HTMLImageElement
                                ).src =
                                  "https://via.placeholder.com/220x180?text=No+Image";
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: 180,
                                borderRadius: "6px",
                                border:
                                  "1.5px solid #FFA500",
                                marginBottom: 8,
                                background: "#fff6e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFA500",
                                fontWeight: "bold",
                              }}
                            >
                              No Image
                            </div>
                          )}
                          <b style={{ color: "#111" }}>
                            {nft.name ||
                              `NFT #${nft.tokenId}`}
                          </b>
                          <div style={{ color: "#111" }}>
                            Collection: {nft.collection}
                          </div>
                          <div style={{ color: "#111" }}>
                            Token ID: {nft.tokenId}
                          </div>
                          <StyledTransactionButton
                            onClick={() =>
                              handleUnstakeNFT(nft)
                            }
                          >
                            Unstake BUMBA BEEZ
                          </StyledTransactionButton>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
          {userNFTs.length === 0 && (
            <p style={{ color: "#111" }}>
              You don&apos;t  hold any BUMBA BEEZ FAM go to the
              buy page and try again.
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
              <div key={nftKey(nft)} style={cardStyle}>
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
                  <div
                    style={{
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
                    }}
                  >
                    No Image
                  </div>
                )}
                <b style={{ color: "#111" }}>
                  {nft.name || `NFT #${nft.tokenId}`}
                </b>
                <div style={{ color: "#111" }}>
                  Collection: {nft.collection}
                </div>
                <div style={{ color: "#111" }}>
                  Token ID: {nft.tokenId}
                </div>
                <StyledTransactionButton
                  onClick={() => handleApproval(nft)}
                >
                  Approve your BUMBA BEEZ
                </StyledTransactionButton>
                <StyledTransactionButton
                  onClick={() => handleStake(nft)}
                >
                  Stake BUMBA BEEZ
                </StyledTransactionButton>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
