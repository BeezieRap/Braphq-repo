import React from "react";
import NFT, { LoadingNFTComponent } from "./NFT";
import {
  DirectListing,
  EnglishAuction,
} from "thirdweb/extensions/marketplace";

type NFTDataItem = {
  tokenId: bigint;
  asset?: any; // Raw NFT metadata (from marketplace listing), which we'll pass as 'nft'
  directListing?: DirectListing;
  auctionListing?: EnglishAuction;
  type?: string;
};

type Props = {
  nftData: NFTDataItem[];
  overrideOnclickBehavior?: (nft: any) => void;
  emptyText?: string;
};

function getPrice(
  directListing?: DirectListing,
  auctionListing?: EnglishAuction,
): string | null {
  if (directListing && directListing.pricePerToken) {
    return typeof directListing.pricePerToken === "string"
      ? directListing.pricePerToken
      : directListing.pricePerToken.toString();
  }
  if (auctionListing) {
    if (auctionListing.buyoutCurrencyValue?.displayValue) {
      return auctionListing.buyoutCurrencyValue
        .displayValue;
    }
    if (
      auctionListing.minimumBidCurrencyValue?.displayValue
    ) {
      return auctionListing.minimumBidCurrencyValue
        .displayValue;
    }
  }
  return null;
}

function hasRequiredMetadata(
  asset?: any,
  directListing?: DirectListing,
  auctionListing?: EnglishAuction,
  type?: string
): boolean {
  if (!asset) return false;
  const hasImage =
    typeof asset.metadata?.image === "string" &&
    asset.metadata.image.length > 0;
  const hasName =
    typeof asset.metadata?.name === "string" &&
    asset.metadata.name.length > 0;
  const hasDescription =
    typeof asset.metadata?.description === "string" &&
    asset.metadata.description.length > 0;
  const hasValidType = type === 'direct-listing' || type === 'english-auction';
  const price = getPrice(directListing, auctionListing);
  const hasPrice =
    price !== null && price !== "" && price !== undefined;
  return hasImage && hasName && hasDescription && (hasPrice || hasValidType);
}

export default function NFTGrid({
  nftData,
  overrideOnclickBehavior,
  emptyText = "No NFTs found for this collection.",
}: Props) {
  console.log("nftData", nftData);

  const filteredData = nftData.filter(
    (listing) =>
      hasRequiredMetadata(
        listing.asset,
        listing.directListing,
        listing.auctionListing,
        listing.type
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
              listingType={nftObj.type || ''}
              listing={nftObj}
              nft={nftObj.asset} // <-- CORRECT: pass as 'nft'
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

// Loading skeleton grid
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
