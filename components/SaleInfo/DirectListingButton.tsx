"use client";

import { NFT } from "@thirdweb-dev/react";
import { useMarketplace } from "@thirdweb-dev/react";
import { TransactionButton } from "thirdweb/react";
import {
  MARKETPLACE,
  NFT_COLLECTION,
} from "@/const/contracts";
import toast from "react-hot-toast";
import toastStyle from "@/util/toastConfig";
import { useRouter } from "next/navigation";

export default function DirectListingButton({
  nft,
  price,
  quantity,
}: {
  nft: NFT;
  price: string;
  quantity: number;
}) {
  const router = useRouter();

  // UseMarketplace returns the correct Marketplace V3 React SDK contract instance
  const marketplace = useMarketplace(MARKETPLACE);

  if (!marketplace) {
    return (
      <button disabled className="btn btn-primary">
        Loading...
      </button>
    );
  }

  return (
    <TransactionButton
      transaction={async () =>
        await marketplace.directListings.createListing({
          assetContractAddress: NFT_COLLECTION,
          tokenId: BigInt(nft.metadata.id),
          quantity,
          currencyContractAddress:
            "0x0000000000000000000000000000000000000000", // Native token (AVAX)
          pricePerToken: price,
          startTimestamp: new Date(),
          endTimestamp: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ), // 7 days from now
        })
      }
      onTransactionSent={() => {
        toast.loading("Listing...", {
          id: "direct-listing",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onError={(error) => {
        toast(`Listing Failed: ${error?.message || ""}`, {
          icon: "❌",
          id: "direct-listing",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onTransactionConfirmed={() => {
        toast("Listed Successfully!", {
          icon: "🥳",
          id: "direct-listing",
          style: toastStyle,
          position: "bottom-center",
        });
        router.push(
          `/token/${NFT_COLLECTION}/${nft.metadata.id}`,
        );
      }}
      className="btn btn-primary"
    >
      List for Sale
    </TransactionButton>
  );
}
