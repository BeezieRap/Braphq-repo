"use client";

import {
  NFT_COLLECTION,
  MARKETPLACE_ADDRESS,
} from "@/const/contracts";

import React from "react";
import NFT, { LoadingNFTComponent } from "./NFT";
// Removed: import { DirectListing, EnglishAuction } from "thirdweb";

type NFTDataItem = {
  tokenId: bigint;
  asset?: any;
  directListing?: any; // Use 'any' for now, or type from hook response
  auctionListing?: any;
  type?: "direct-listing" | "english-auction";
};

type Props = {
  nftData: NFTDataItem[];
  overrideOnclickBehavior?: (nft: any) => void;
  emptyText?: string;
  onPurchaseSuccess?: (
    contractAddress: string,
    tokenId: string,
  ) => void;
};

function getPrice(
  directListing?: any,
  auctionListing?: any,
): string | null {
  if (directListing?.pricePerToken) {
    return directListing.pricePerToken.toString();
  }
  if (
    auctionListing?.buyoutCurrencyValuePerToken
      ?.displayValue
  ) {
    return auctionListing.buyoutCurrencyValuePerToken
      .displayValue;
  }
  if (auctionListing?.minimumBidAmount?.displayValue) {
    return auctionListing.minimumBidAmount.displayValue;
  }
  return null;
}

function hasRequiredMetadata(
  asset?: any,
  directListing?: any,
  auctionListing?: any,
  type?: string,
): boolean {
  if (!asset) return false;
  const { metadata } = asset;
  const hasImage =
    typeof metadata?.image === "string" &&
    metadata.image.length > 0;
  const hasName =
    typeof metadata?.name === "string" &&
    metadata.name.length > 0;
  const hasDescription =
    typeof metadata?.description === "string" &&
    metadata.description.length > 0;
  const hasValidType =
    type === "direct-listing" || type === "english-auction";
  const price = getPrice(directListing, auctionListing);
  const hasPrice = price !== null && price !== "";
  return (
    hasImage &&
    hasName &&
    hasDescription &&
    (hasPrice || hasValidType)
  );
}

export default function NFTGrid({
  nftData,
  overrideOnclickBehavior,
  emptyText = "No NFTs found for this collection.",
  onPurchaseSuccess,
}: Props) {
  const filteredData = nftData.filter((listing) =>
    hasRequiredMetadata(
      listing.asset,
      listing.directListing,
      listing.auctionListing,
      listing.type,
    ),
  );

  if (filteredData.length > 0) {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "center",
        }}
      >
        {filteredData.map((nftObj) =>
          nftObj.asset ? (
            <NFT
              key={
                nftObj.asset.metadata?.id?.toString() ||
                nftObj.asset.metadata?.tokenId?.toString() ||
                nftObj.tokenId.toString()
              }
              listingType={nftObj.type || ""}
              listing={nftObj}
              nft={nftObj.asset}
              tokenId={nftObj.tokenId}
              overrideOnclickBehavior={
                overrideOnclickBehavior
              }
            />
          ) : null,
        )}
      </div>
    );
  }

  return <div>{emptyText}</div>;
}

export function NFTGridLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        justifyContent: "center",
      }}
    >
      {[...Array(20)].map((_, index) => (
        <LoadingNFTComponent key={index} />
      ))}
    </div>
  );
}
