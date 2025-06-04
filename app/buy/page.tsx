"use client";
import React, { Suspense, useState } from "react";
import { NFTGridLoading } from "@/components/NFT/NFTGrid";
import ListingGrid from "@/components/ListingGrid/ListingGrid";
import {
  MARKETPLACE,
  NFT_COLLECTIONS,
} from "@/const/contracts";

// BRAP token contract address
const BRAP_TOKEN_ADDRESS =
  "0x5b3Ff4d494E9Ee69eE0f52Ab9656cFfe99D4839E";

// SOLVES: Type error by casting to string or giving default fallback
const marketplace: string = MARKETPLACE ?? "";

export default function BuyPage() {
  const [confirmation, setConfirmation] = useState<{
    contractAddress: string;
    tokenId: string;
  } | null>(null);

  // This function will be called by ListingGrid after a successful purchase
  const handlePurchaseSuccess = (
    contractAddress: string,
    tokenId: string,
  ) => {
    setConfirmation({ contractAddress, tokenId });
  };

  return (
    <div className="bg-white min-h-screen text-black p-4">
      <h1 className="text-4xl font-bold mb-6">
        Buy Bumba Beez
      </h1>
      <Suspense fallback={<NFTGridLoading />}>
        <ListingGrid
          marketplace={marketplace}
          collections={NFT_COLLECTIONS}
          brapTokenAddress={BRAP_TOKEN_ADDRESS}
          emptyText="No listed NFTs in these collections. Check your contract on the Thirdweb Dashboard: https://thirdweb.com/dashboard"
          onPurchaseSuccess={handlePurchaseSuccess} // Pass the callback
        />
      </Suspense>
      {confirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              You're now a Bumba Beez Collector!
            </h2>
            <p className="mb-2">Welcome to the swarm 🐝</p>
            <p className="mb-2">
              Add your NFT to your wallet by copying the
              contract address and ID below.
            </p>
            <div className="mb-2">
              <strong>Contract Address:</strong>
              <div className="break-all">
                {confirmation.contractAddress}
              </div>
            </div>
            <div className="mb-4">
              <strong>Token ID:</strong>{" "}
              {confirmation.tokenId}
            </div>
            <p className="mb-4">
              Then Stake your Bumba Beez for $BRAPTKN
              Rewards.
            </p>
            <button
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded"
              onClick={() => setConfirmation(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
