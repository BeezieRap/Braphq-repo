"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import cn from "classnames";
import {
  useActiveWallet,
  useContract,
  useReadContract,
} from "thirdweb/react";
import type { NFT } from "thirdweb";

import AuctionListingButton from "./AuctionListingButton";
import DirectListingButton from "./DirectListingButton";
import ApproveButton from "./ApproveButton";

const ADDRESS_ZERO = ethers.constants.AddressZero;

type Props = {
  nft: NFT;
};

const INPUT_STYLES =
  "block w-full py-3 px-4 mb-4 bg-transparent border border-white text-base box-shadow-md rounded-lg";
const LEGEND_STYLES = "mb-2 text-white/80";

export default function SaleInfo({ nft }: Props) {
  const { address } = useActiveWallet();

  // v5 contracts
  const { contract: nftCollectionContract } = useContract(
    "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
    "nft-collection",
  );
  const { contract: marketplaceContract } = useContract(
    "0x586d90eceDAf6627832f1B6081CAfc4Ea27fAf6A",
    "marketplace-v3",
  );

  const [tab, setTab] = useState<"direct" | "auction">(
    "direct",
  );

  // v5 contract read
  const { data: approvalData } = useReadContract({
    contract: nftCollectionContract,
    method: "isApprovedForAll",
    params: [
      address || ADDRESS_ZERO,
      marketplaceContract
        ? marketplaceContract.getAddress()
        : ADDRESS_ZERO,
    ],
  });

  const hasApproval = approvalData === true;
  const [directListingState, setDirectListingState] =
    useState({ price: "0" });
  const [auctionListingState, setAuctionListingState] =
    useState({
      minimumBidAmount: "0",
      buyoutPrice: "0",
    });

  // Patch for ERC721 supply
  const nftWithSupply: NFT = {
    ...nft,
    supply: nft.supply ?? "1",
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-start w-full mb-6 border-b border-white/60">
        <h3
          className={cn(
            "px-4 h-12 flex items-center justify-center text-base font-semibold cursor-pointer transition-all hover:text-white/80",
            tab === "direct" &&
              "text-[#0294fe] border-b-2 border-[#0294fe]",
          )}
          onClick={() => setTab("direct")}
        >
          Direct
        </h3>
        <h3
          className={cn(
            "px-4 h-12 flex items-center justify-center text-base font-semibold cursor-pointer transition-all hover:text-white/80",
            tab === "auction" &&
              "text-[#0294fe] border-b-2 border-[#0294fe]",
          )}
          onClick={() => setTab("auction")}
        >
          Auction
        </h3>
      </div>

      {/* Direct Listing */}
      <div
        className={cn(
          tab === "direct" ? "flex" : "hidden",
          "flex-col",
        )}
      >
        <legend className={LEGEND_STYLES}>
          Price per token
        </legend>
        <input
          className={INPUT_STYLES}
          type="number"
          step={0.000001}
          value={directListingState.price}
          onChange={(e) =>
            setDirectListingState({ price: e.target.value })
          }
        />
        {!hasApproval ? (
          <ApproveButton />
        ) : (
          <DirectListingButton
            nft={nftWithSupply}
            price={directListingState.price}
            quantity={1}
          />
        )}
      </div>

      {/* Auction Listing */}
      <div
        className={cn(
          tab === "auction" ? "flex" : "hidden",
          "flex-col",
        )}
      >
        <legend className={LEGEND_STYLES}>
          Allow bids starting from
        </legend>
        <input
          className={INPUT_STYLES}
          type="number"
          step={0.000001}
          value={auctionListingState.minimumBidAmount}
          onChange={(e) =>
            setAuctionListingState({
              ...auctionListingState,
              minimumBidAmount: e.target.value,
            })
          }
        />

        <legend className={LEGEND_STYLES}>
          Buyout price
        </legend>
        <input
          className={INPUT_STYLES}
          type="number"
          step={0.000001}
          value={auctionListingState.buyoutPrice}
          onChange={(e) =>
            setAuctionListingState({
              ...auctionListingState,
              buyoutPrice: e.target.value,
            })
          }
        />

        {!hasApproval ? (
          <ApproveButton />
        ) : (
          <AuctionListingButton
            nft={nftWithSupply}
            minimumBidAmount={
              auctionListingState.minimumBidAmount
            }
            buyoutBidAmount={
              auctionListingState.buyoutPrice
            }
          />
        )}
      </div>
    </div>
  );
}
