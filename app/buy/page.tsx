"use client";

import React from "react";
import ListingGrid from "@/components/ListingGrid/ListingGrid"; // FIX: Corrected import path
import {
  MARKETPLACE_ADDRESS,
  NFT_COLLECTIONS,
} from "@/const/contracts";

export default function BuyPage() {
  const handlePurchaseSuccess = (
    contractAddress: string,
    tokenId: string,
  ) => {
    console.log(
      "✅ Purchase successful:",
      contractAddress,
      tokenId,
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Buy NFTs</h1>
      <ListingGrid
        marketplaceAddress="0x586d90eceDAf6627832f1B6081CAfc4Ea27fAf6A"
        collections={[
          "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
          "0x7a30231BD80C7F0C5413BA15bb5A2206Fa801c81",
          "0x9d29d7C8871C093448113be59505CdA5E88f13f4",
        ]}
        emptyText="No NFTs are currently listed for sale."
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </main>
  );
}
