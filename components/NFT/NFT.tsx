"use client";
import React, { useEffect, useState } from "react";
import { defineChain, getContract, NFT } from "thirdweb";
import { NFT_COLLECTION } from "../../const/contracts";
import {
  DirectListing,
  EnglishAuction,
} from "thirdweb/extensions/marketplace";
import {
  MediaRenderer,
  BuyDirectListingButton,
} from "thirdweb/react";
import { getNFT } from "thirdweb/extensions/erc721";
import client from "@/lib/client";
import Skeleton from "@/components/Skeleton";
import { useRouter } from "next/navigation";

// Set your marketplace contract address here
const MARKETPLACE_CONTRACT =
  "0x586d90eceDAf6627832f1B6081CAfc4Ea27fAf6A"; // <-- IMPORTANT: Replace this if needed

type Props = {
  tokenId: bigint;
  nft?: NFT;
  listingType: string;
  listing: any;
  directListing?: DirectListing;
  auctionListing?: EnglishAuction;
  overrideOnclickBehavior?: (nft: NFT) => void;
};
const chain = defineChain(43114); // Avalanche C-Chain

export default function NFTComponent({
  tokenId,
  directListing,
  auctionListing,
  listing,
  listingType,
  overrideOnclickBehavior,
  ...props
}: Props) {
  const router = useRouter();
  const [nft, setNFT] = useState(props.nft);

  useEffect(() => {
    console.log(
      "NFT_COLLECTION address:",
      NFT_COLLECTION,
      nft,
      listing,
    );
    if (nft?.id !== tokenId) {
      getNFT({
        contract: getContract({
          client,
          chain,
          address: NFT_COLLECTION,
        }),
        tokenId: tokenId,
        includeOwner: true,
      }).then((nft) => {
        setNFT(nft);
      });
    }
  }, [tokenId, nft, listing]);

  if (!nft) {
    return <LoadingNFTComponent />;
  }

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full bg-white/[.04] justify-stretch border overflow-hidden border-white/10 rounded-lg"
      onClick={
        overrideOnclickBehavior
          ? () => overrideOnclickBehavior(nft!)
          : () =>
              router.push(
                `/token/${NFT_COLLECTION}/${tokenId.toString()}`,
              )
      }
    >
      <div className="flex w-full bg-white/[.04]">
        {/* Left side: NFT image */}
        <div className="relative w-1/2 aspect-square flex-shrink-0">
          {nft.metadata.image && (
            <MediaRenderer
              src={nft.metadata.image}
              client={client}
              className="object-cover object-center w-full h-full"
            />
          )}
        </div>
        {/* Right side: info, description, price as buy button */}
        <div className="flex flex-col justify-between w-1/2 p-4 min-h-[220px]">
          <div>
            <p className="overflow-hidden text-lg text-black whitespace-nowrap">
              {nft.metadata.name}
            </p>
            <p className="text-sm font-semibold text-black">
              #{nft.id.toString()}
            </p>
            {nft.metadata?.description && (
              <p className="text-sm font-semibold text-black mt-2">
                {nft.metadata.description}
              </p>
            )}
          </div>
          {listingType === "direct-listing" && listing && (
            <div className="w-full flex justify-end mt-4">
              <BuyDirectListingButton
                contractAddress={MARKETPLACE_CONTRACT}
                chain={chain}
                client={client}
                listingId={listing.id}
                style={{
                  padding: "0.75em 1.5em",
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  color: "#fff",
                  background:
                    "linear-gradient(90deg,#FFD600,#FF9600)", // yellow/orange gradient
                  border: "none",
                  borderRadius: "0.5em",
                  marginTop: "1em",
                  marginRight: "0.5em",
                  cursor: "pointer",
                }}
              >
                {listing?.currencyValuePerToken.displayValue}
                {listing?.currencyValuePerToken.tokenAddress ===
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                  ? "AVAX"
                  : listing?.currencyValuePerToken.symbol}
              </BuyDirectListingButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoadingNFTComponent() {
  return (
    <div className="w-full rounded-lg">
      <Skeleton width="100%" height="100%" />
    </div>
  );
}
