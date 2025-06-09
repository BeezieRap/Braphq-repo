"use client";

import React, { useEffect, useState } from "react";
import { useContract, useListings } from "thirdweb/react";
import {
  MARKETPLACE_ADDRESS,
  NFT_COLLECTIONS,
} from "@/const/contracts";
import { DirectListingV3 } from "thirdweb/sdk";
import NFTGrid from "@/components/NFT/NFTGrid";

interface Props {
  marketplaceAddress: string;
  collections: string[];
  emptyText: string;
  onPurchaseSuccess: (
    contractAddress: string,
    tokenId: string,
  ) => void;
}

type NFTDataItem = {
  tokenId: bigint;
  asset: any;
  directListing: DirectListingV3;
  type: "direct-listing";
};

export default function ListingGrid({
  marketplaceAddress,
  collections,
  emptyText,
  onPurchaseSuccess,
}: Props) {
  const { contract: marketplace } = useContract(
    marketplaceAddress,
    "marketplace-v3",
  );
  const [filteredListings, setFilteredListings] = useState<
    NFTDataItem[]
  >([]);
  const { data: listings, isLoading } =
    useListings(marketplace);

  useEffect(() => {
    if (!listings) return;
    const normalizedCollections = collections.map((addr) =>
      addr.toLowerCase(),
    );
    const filtered = listings
      .filter((listing) =>
        normalizedCollections.includes(
          listing.assetContractAddress.toLowerCase(),
        ),
      )
      .map((listing) => ({
        tokenId: BigInt(listing.tokenId),
        asset: listing.asset,
        directListing: listing,
        type: "direct-listing" as const, // FIX: type narrowed
      }));
    setFilteredListings(filtered);
  }, [listings, collections]);

  if (isLoading) return <div>Loading listings...</div>;
  if (!filteredListings.length)
    return <div>{emptyText}</div>;

  return (
    <NFTGrid
      nftData={filteredListings}
      onPurchaseSuccess={onPurchaseSuccess}
    />
  );
}
