"use client";
import React, { Suspense } from "react";
import { NFTGridLoading } from "@/components/NFT/NFTGrid";
import ListingGrid from "@/components/ListingGrid/ListingGrid";
import { MARKETPLACE, NFT_COLLECTIONS } from "@/const/contracts";

// SOLVES: Type error by casting to string or giving default fallback
const marketplace: string = MARKETPLACE ?? "";

export default function BuyPage() {
  return (
    <div className="bg-white min-h-screen text-black p-4">
      <h1 className="text-4xl font-bold mb-6">Buy NFTs</h1>
      <Suspense fallback={<NFTGridLoading />}>
        <ListingGrid
          marketplace={marketplace}
          collections={NFT_COLLECTIONS}
          emptyText="No listed NFTs in these collections. Check your contract on the Thirdweb Dashboard: https://thirdweb.com/dashboard"
        />
      </Suspense>
    </div>
  );
}