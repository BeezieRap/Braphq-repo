"use client";

import React, { Suspense } from "react";
import { NFTGridLoading } from "@/components/NFT/NFTGrid";
import ListingGrid from "@/components/ListingGrid/ListingGrid";
import {
  MARKETPLACE,
  NFT_COLLECTION,
} from "@/const/contracts";

export default function BuyPage() {
  return (
    <div className="bg-white min-h-screen text-black p-4">
      <h1 className="text-4xl font-bold mb-6">Buy NFTs</h1>
      <Suspense fallback={<NFTGridLoading />}>
        <ListingGrid
          marketplace={MARKETPLACE}
          collection={NFT_COLLECTION}
          emptyText="No listed NFTs in this collection. Check your contract on the Thirdweb Dashboard: https://thirdweb.com/dashboard"
        />
      </Suspense>
    </div>
  );
}
