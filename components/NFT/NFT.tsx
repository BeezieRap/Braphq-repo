"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useContract,
  useNFT,
  useValidDirectListings,
  MediaRenderer,
  useThirdwebClient,
} from "thirdweb/react";
import { NFT } from "thirdweb";
import Skeleton from "@/components/Skeleton";
import {
  NFT_COLLECTION,
  MARKETPLACE_ADDRESS,
} from "@/const/contracts";

type Props = {
  tokenId: bigint;
  nft?: NFT;
  listingType: string;
  listing?: any;
  overrideOnclickBehavior?: (nft: NFT) => void;
};

function NFTComponent({
  tokenId,
  nft: initialNFT,
  listing,
  listingType,
  overrideOnclickBehavior,
}: Props) {
  const router = useRouter();
  const client = useThirdwebClient();

  const { contract: nftContract } = useContract(
    NFT_COLLECTION,
    "nft-collection",
  );
  const { data: nft, isLoading: isNFTLoading } = useNFT(
    nftContract,
    tokenId,
  );

  const displayNFT = initialNFT ?? nft;

  const { data: directListings } = useValidDirectListings(
    MARKETPLACE_ADDRESS,
    {
      tokenContract: NFT_COLLECTION,
      tokenId: tokenId.toString(),
    },
  );

  const price =
    listing?.currencyValuePerToken?.displayValue ??
    directListings?.[0]?.currencyValuePerToken
      ?.displayValue ??
    null;

  const currency =
    listing?.currencyValuePerToken?.symbol ??
    directListings?.[0]?.currencyValuePerToken?.symbol ??
    null;

  if (isNFTLoading || !displayNFT) {
    return <LoadingNFTComponent />;
  }

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full bg-white/[.04] justify-stretch border overflow-hidden border-white/10 rounded-lg"
      onClick={
        overrideOnclickBehavior
          ? () => overrideOnclickBehavior(displayNFT)
          : () =>
              router.push(
                `/token/${NFT_COLLECTION}/${tokenId.toString()}`,
              )
      }
    >
      <div className="flex w-full bg-white/[.04]">
        {/* Left side: NFT image */}
        <div className="relative w-1/2 aspect-square flex-shrink-0">
          <MediaRenderer
            client={client} // FIX: Required prop
            src={displayNFT.metadata.image}
            className="object-cover object-center w-full h-full"
          />
        </div>

        {/* Right side: Metadata + Price */}
        <div className="flex flex-col justify-between w-1/2 p-4 min-h-[220px]">
          <div>
            <p className="overflow-hidden text-lg text-black whitespace-nowrap">
              {displayNFT.metadata.name}
            </p>
            <p className="text-sm font-semibold text-black">
              #
              {displayNFT.metadata.id || tokenId.toString()}
            </p>
            {displayNFT.metadata?.description && (
              <p className="text-sm font-semibold text-black mt-2">
                {displayNFT.metadata.description}
              </p>
            )}
          </div>

          {price && (
            <div className="w-full flex justify-end mt-4">
              <button
                className="px-4 py-2 text-white font-bold text-md rounded-md"
                style={{
                  background:
                    "linear-gradient(90deg,#FFD600,#FF9600)",
                }}
              >
                Buy for {price} {currency}
              </button>
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

export default NFTComponent;
