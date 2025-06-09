"use client";

import { TransactionButton, useActiveAccount } from "thirdweb/react";
import {
  DirectListing,
  EnglishAuction,
  buyFromListing,
  buyoutAuction,
} from "thirdweb/extensions/marketplace";
import { MARKETPLACE } from "@/const/contracts";
import toast from "react-hot-toast";
import toastStyle from "@/util/toastConfig";

export default function BuyListingButton({
  auctionListing,
  directListing,
}: {
  auctionListing?: EnglishAuction;
  directListing?: DirectListing;
}) {
  const account = useActiveAccount();

  return (
    <TransactionButton
      disabled={
        account?.address === auctionListing?.creatorAddress ||
        account?.address === directListing?.creatorAddress ||
        (!directListing && !auctionListing)
      }
      transaction={() => {
        if (!account) throw new Error("No account connected");

        if (auctionListing) {
          return buyoutAuction({
            contract: MARKETPLACE,
            auctionId: auctionListing.id,
          });
        } else if (directListing) {
          return buyFromListing({
            contract: MARKETPLACE,
            listingId: directListing.id,
            recipient: account.address,
            quantity: BigInt(1),
          });
        } else {
          throw new Error("No valid listing found for this NFT");
        }
      }}
      onTransactionSent={() => {
        toast.loading("Purchasing...", {
          id: "buy",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onError={() => {
        toast("Purchase Failed!", {
          icon: "❌",
          id: "buy",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      onTransactionConfirmed={() => {
        toast("Purchased Successfully!", {
          icon: "🥳",
          id: "buy",
          style: toastStyle,
          position: "bottom-center",
        });
      }}
      className="btn btn-primary"
    >
      Buy Now
    </TransactionButton>
  );
}
