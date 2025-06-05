"use client";

import { NFT as NFTType } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { createAuction } from "thirdweb/extensions/marketplace";
import { MARKETPLACE, NFT_COLLECTION } from "@/const/contracts";
import toast from "react-hot-toast";
import toastStyle from "@/util/toastConfig";

// If you can import Contract class from thirdweb and instantiate it manually:
import { Contract } from "@thirdweb-dev/sdk";

export default function AuctionListingButton({
  nft,
  minimumBidAmount,
  buyoutBidAmount,
}: {
  nft: NFTType;
  minimumBidAmount: string;
  buyoutBidAmount: string;
}) {
  const router = useRouter();

  // Manually instantiate the marketplace contract instance using the address (and signer/provider)
  // NOTE: Adjust 'signerOrProvider' as per your app context, here we pass undefined (default)
  const marketplaceContract = new Contract(MARKETPLACE);

  return (
    <TransactionButton
      transaction={() => {
        return createAuction({
          contract: marketplaceContract,
          assetContractAddress: NFT_COLLECTION, // just the address string
          tokenId: nft.id,
          minimumBidAmount,
          buyoutBidAmount,
        });
      }}
      onTransactionSent={() => {
        toast.loading("Listing...", {
          id: "auction",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onError={() => {
        toast("Listing Failed!", {
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
        router.push(`/token/${NFT_COLLECTION}/${nft.id.toString()}`);
      }}
    >
      List for Auction
    </TransactionButton>
  );
}
