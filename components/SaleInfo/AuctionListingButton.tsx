"use client";

import { NFT, useMarketplace } from "@thirdweb-dev/react";
import { TransactionButton } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { createAuction } from "thirdweb/extensions/marketplace";
import { MARKETPLACE, NFT_COLLECTION } from "@/const/contracts";
import toast from "react-hot-toast";
import toastStyle from "@/util/toastConfig";

export default function AuctionListingButton({
  nft,
  minimumBidAmount,
  buyoutBidAmount,
}: {
  nft: NFT;
  minimumBidAmount: string;
  buyoutBidAmount: string;
}) {
  const router = useRouter();

  // Use useMarketplace hook to get correctly typed marketplace contract
  const { contract: marketplaceContract, isLoading } = useMarketplace(MARKETPLACE);

  if (isLoading || !marketplaceContract) {
    return (
      <button disabled className="btn btn-primary">
        Loading...
      </button>
    );
  }

  return (
    <TransactionButton
      transaction={() =>
        createAuction({
          contract: marketplaceContract,
          assetContractAddress: NFT_COLLECTION,
          tokenId: nft.metadata.id, // Correct property for token ID
          minimumBidAmount,
          buyoutBidAmount,
        })
      }
      onTransactionSent={() => {
        toast.loading("Listing...", {
          id: "auction",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onError={(error) => {
        toast(`Listing Failed: ${error?.message || ""}`, {
          icon: "❌",
          id: "auction",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onTransactionConfirmed={() => {
        toast("Listed Successfully!", {
          icon: "🥳",
          id: "auction",
          style: toastStyle,
          position: "bottom-center",
        });
        router.push(`/token/${NFT_COLLECTION}/${nft.metadata.id}`);
      }}
      className="btn btn-primary"
    >
      List for Auction
    </TransactionButton>
  );
}
