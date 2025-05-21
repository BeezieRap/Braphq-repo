import React, { useEffect, useState } from "react";
import NFTGrid from "@/components/NFT/NFTGrid";
import client from "@/lib/client";
import { getAllListings } from "thirdweb/extensions/marketplace";
import { getContract, defineChain } from "thirdweb";

type Props = {
  marketplace: string;
  collections: string[];
  emptyText?: string;
};

const chain = defineChain(43114); // Avalanche C-Chain

export default function ListingGrid({ marketplace, collections, emptyText }: Props) {
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchListings() {
      setLoading(true);
      let accum: any[] = [];
      try {
        const contract = getContract({
          client,
          chain,
          address: marketplace,
        });
        const all = await getAllListings({
          contract,
          start: 0n,
          count: 100n,
        });
        const normalizedCollections = collections.map(addr => addr.toLowerCase().replace(/\s/g, ""));
        const filtered = all.filter((listing: any) =>
          normalizedCollections.includes(
            (listing.assetContractAddress || listing.asset?.contractAddress || "").toLowerCase()
          )
        );
        accum = filtered;
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
      if (!cancelled) {
        setAllListings(accum);
        setLoading(false);
      }
    }
    fetchListings();
    return () => { cancelled = true; };
  }, [marketplace, collections]);

  if (loading) return <div>Loading...</div>;
  if (!allListings.length) return <div>{emptyText || "No NFTs found"}</div>;
  return <NFTGrid nftData={allListings} />;
}