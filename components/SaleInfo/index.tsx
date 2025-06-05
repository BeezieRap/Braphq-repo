import { NFT as NFTType } from "@thirdweb-dev/sdk";
import React, { useState } from "react";

import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { ethers } from "ethers";
// Removed unused import:
// import { isApprovedForAll } from "@thirdweb-dev/sdk/dist/declarations/src/extensions/erc721";
import AuctionListingButton from "./AuctionListingButton";
import DirectListingButton from "./DirectListingButton";
import cn from "classnames";
import ApprovalButton from "./ApproveButton";

const ADDRESS_ZERO = ethers.constants.AddressZero;

type Props = {
  nft: NFTType;
};

const INPUT_STYLES =
  "block w-full py-3 px-4 mb-4 bg-transparent border border-white text-base box-shadow-md rounded-lg mb-4";
const LEGEND_STYLES = "mb-2 text-white/80";

export default function SaleInfo({ nft }: Props) {
  // useAddress replaces useActiveAccount
  const address = useAddress();

  const { contract: nftCollectionContract } = useContract(
    "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
    "nft-collection"
  );
  const { contract: marketplaceContract } = useContract(
    "0x586d90eceDAf6627832f1B6081CAfc4Ea27fAf6A",
    "marketplace"
  );

  const [tab, setTab] = useState<"direct" | "auction">("direct");

  // only call useContractRead if contracts are ready
  const { data: hasApproval } = useContractRead(
    nftCollectionContract,
    "isApprovedForAll",
    [address || ADDRESS_ZERO, marketplaceContract?.getAddress() || ADDRESS_ZERO]
  );

  const [directListingState, setDirectListingState] = useState({
    price: "0",
  });
  const [auctionListingState, setAuctionListingState] = useState({
    minimumBidAmount: "0",
    buyoutPrice: "0",
  });

  return (
    <>
      <div className="">
        <div className="flex justify-start w-full mb-6 border-b border-white/60">
          <h3
            className={cn(
              "px-4 h-12 flex items-center justify-center text-base font-semibold cursor-pointer transition-all hover:text-white/80",
              tab === "direct" && "text-[#0294fe] border-b-2 border-[#0294fe]"
            )}
            onClick={() => setTab("direct")}
          >
            Direct
          </h3>
          <h3
            className={cn(
              "px-4 h-12 flex items-center justify-center text-base font-semibold cursor-pointer transition-all hover:text-white/80",
              tab === "auction" && "text-[#0294fe] border-b-2 border-[#0294fe]"
            )}
            onClick={() => setTab("auction")}
          >
            Auction
          </h3>
        </div>

        {/* Direct listing fields */}
        <div
          className={cn(
            tab === "direct" ? "flex" : "hidden",
            "flex-col"
          )}
        >
          <legend className={cn(LEGEND_STYLES)}>
            Price per token
          </legend>
          <input
            className={cn(INPUT_STYLES)}
            type="number"
            step={0.000001}
            value={directListingState.price}
            onChange={(e) =>
              setDirectListingState({ price: e.target.value })
            }
          />
          {!hasApproval ? (
            <ApprovalButton />
          ) : (
            <DirectListingButton
              nft={nft}
              pricePerToken={directListingState.price}
            />
          )}
        </div>

        {/* Auction listing fields */}
        <div
          className={cn(
            tab === "auction" ? "flex" : "hidden",
            "flex-col"
          )}
        >
          <legend className={cn(LEGEND_STYLES)}>
            Allow bids starting from
          </legend>
          <input
            className={cn(INPUT_STYLES)}
            step={0.000001}
            type="number"
            value={auctionListingState.minimumBidAmount}
            onChange={(e) =>
              setAuctionListingState({
                ...auctionListingState,
                minimumBidAmount: e.target.value,
              })
            }
          />

          <legend className={cn(LEGEND_STYLES)}>
            Buyout price
          </legend>
          <input
            className={cn(INPUT_STYLES)}
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
            <ApprovalButton />
          ) : (
            <AuctionListingButton
              nft={nft}
              minimumBidAmount={auctionListingState.minimumBidAmount}
              buyoutBidAmount={auctionListingState.buyoutPrice}
            />
          )}
        </div>
      </div>
    </>
  );
}
