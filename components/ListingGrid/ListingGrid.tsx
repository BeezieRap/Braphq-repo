"use client";

import React, { useEffect, useState } from "react";
import {
  getAllValidListings,
  getAllValidAuctions,
  DirectListing,
  EnglishAuction,
} from "thirdweb/extensions/marketplace";
import { ThirdwebContract, NFT } from "thirdweb";
import {
  getNFT,
  getOwnedNFTs,
} from "thirdweb/extensions/erc721";
import { useActiveAccount } from "thirdweb/react";
import NFTGrid, { NFTGridLoading } from "../NFT/NFTGrid";

// Data item shape for grid
type NFTDataItem = {
  tokenId: bigint;
  asset: NFT;
  directListing?: DirectListing;
  auctionListing?: EnglishAuction;
};

type Props = {
  marketplace: ThirdwebContract;
  collection: ThirdwebContract;
  mode?: "all" | "owned"; // "all" = marketplace, "owned" = only owned by connected user
  overrideOnclickBehavior?: (nft: NFT) => void;
  emptyText: string;
};

export default function ListingGrid(props: Props) {
  const [loading, setLoading] = useState(true);
  const [nftData, setNftData] = useState<NFTDataItem[]>([]);
  const activeAccount = useActiveAccount(); // Updated for SDK v5
  const address = activeAccount?.address;

  // Store owned NFTs manually (no hook in v5)
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [ownedLoading, setOwnedLoading] = useState(false);

  // Fetch owned NFTs when relevant
  useEffect(() => {
    if (
      props.mode !== "owned" ||
      !props.collection ||
      !address
    ) {
      setOwnedNFTs([]);
      setOwnedLoading(false);
      return;
    }
    let ignore = false;
    setOwnedLoading(true);
    getOwnedNFTs({
      contract: props.collection,
      owner: address,
    })
      .then((result) => {
        if (!ignore) setOwnedNFTs(result || []);
      })
      .catch(() => {
        if (!ignore) setOwnedNFTs([]);
      })
      .finally(() => {
        if (!ignore) setOwnedLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [props.collection, address, props.mode]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Helper: fetch all valid marketplace listings and auctions
    async function fetchListingsAndAuctions() {
      try {
        const [listings, auctions] = await Promise.all([
          getAllValidListings({
            contract: props.marketplace,
          }),
          getAllValidAuctions({
            contract: props.marketplace,
          }),
        ]);

        // Filter to this collection only
        const listingItems = await Promise.all(
          (listings || [])
            .filter(
              (l: DirectListing) =>
                l.assetContractAddress.toLowerCase() ===
                props.collection.address.toLowerCase(),
            )
            .map(async (l: DirectListing) => {
              let asset = l.asset as NFT | undefined;
              let tokenId: bigint;
              try {
                tokenId =
                  typeof l.tokenId === "bigint"
                    ? l.tokenId
                    : BigInt(l.tokenId as string | number);
              } catch {
                return null;
              }
              if (!asset) {
                try {
                  asset = await getNFT({
                    contract: props.collection,
                    tokenId,
                  });
                } catch {
                  asset = undefined;
                }
              }
              if (!asset) return null;
              return {
                tokenId,
                asset,
                directListing: l,
                auctionListing: undefined,
              } as NFTDataItem;
            }),
        );

        const auctionItems = await Promise.all(
          (auctions || [])
            .filter(
              (a: EnglishAuction) =>
                a.assetContractAddress.toLowerCase() ===
                props.collection.address.toLowerCase(),
            )
            .map(async (a: EnglishAuction) => {
              let asset = a.asset as NFT | undefined;
              let tokenId: bigint;
              try {
                tokenId =
                  typeof a.tokenId === "bigint"
                    ? a.tokenId
                    : BigInt(a.tokenId as string | number);
              } catch {
                return null;
              }
              if (!asset) {
                try {
                  asset = await getNFT({
                    contract: props.collection,
                    tokenId,
                  });
                } catch {
                  asset = undefined;
                }
              }
              if (!asset) return null;
              return {
                tokenId,
                asset,
                directListing: undefined,
                auctionListing: a,
              } as NFTDataItem;
            }),
        );

        const itemsResolved: NFTDataItem[] = [
          ...listingItems.filter(
            (item): item is NFTDataItem => !!item,
          ),
          ...auctionItems.filter(
            (item): item is NFTDataItem => !!item,
          ),
        ];

        if (mounted) setNftData(itemsResolved);
      } catch (err) {
        if (mounted) setNftData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // If explicitly in "owned" mode, just use wallet NFTs
    if (props.mode === "owned") {
      if (!ownedLoading && ownedNFTs && address) {
        // Convert each owned NFT to NFTDataItem
        const ownedItems: NFTDataItem[] = ownedNFTs.map(
          (nft: NFT) => ({
            tokenId:
              typeof nft.id === "bigint"
                ? nft.id
                : BigInt(nft.id),
            asset: nft,
          }),
        );
        setNftData(ownedItems);
        setLoading(false);
      } else {
        setLoading(true);
      }
      return;
    }

    // Otherwise, fetch marketplace listings/auctions as before
    fetchListingsAndAuctions();

    return () => {
      mounted = false;
    };
  }, [
    props.marketplace,
    props.collection,
    props.mode,
    ownedNFTs,
    ownedLoading,
    address,
  ]);

  if (loading) return <NFTGridLoading />;

  return (
    <NFTGrid
      nftData={nftData}
      emptyText={props.emptyText}
      overrideOnclickBehavior={
        props.overrideOnclickBehavior
      }
    />
  );
}
