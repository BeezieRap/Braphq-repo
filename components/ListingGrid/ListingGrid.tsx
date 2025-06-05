import React, { useEffect, useState } from "react";
import NFTGrid from "@/components/NFT/NFTGrid";
import client from "@/lib/client";
import { getAllListings } from "thirdweb/extensions/marketplace";
import { getContract, defineChain } from "thirdweb";

interface Props {
  marketplace: string;
  collections: string[];
  brapTokenAddress: string; // ✅ added
  emptyText: string; // ✅ changed from optional to required (matches usage)
  onPurchaseSuccess: (contractAddress: string, tokenId: string) => void; // ✅ added
}

const chain = defineChain(43114); // Avalanche C-Chain

export default function ListingGrid({
  marketplace,
  collections,
  brapTokenAddress, // ✅ included here
  emptyText,
  onPurchaseSuccess, // ✅ included here
}: Props) {
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!marketplace) return;

    let cancelled = false;

    async function fetchListings() {
      try {
        setLoading(true);

        const contract = getContract({
          client,
          chain,
          address: marketplace,
        });

        const all = await getAllListings({
          contract,
          start: 0,
          count: 100n,
        });

        let filteredListings = all;

        if (collections?.length) {
          const normalizedCollections = collections.map((addr) =>
            addr.toLowerCase()
          );

          filteredListings = all.filter((listing: any) => {
            console.log(listing);
            const address = listing.assetContractAddress?.toLowerCase();
            console.log(address, normalizedCollections.includes(address));
            return normalizedCollections.includes(address);
          });
        }
        console.log(filteredListings);

        if (!cancelled) {
          setAllListings(filteredListings);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        if (!cancelled) setAllListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListings();
    return () => {
      cancelled = true;
    };
  }, [marketplace, collections]);

  if (loading) return <div>Loading...</div>;
  if (!allListings.length) return <div>{emptyText || "No NFTs found"}</div>;

  return <NFTGrid nftData={allListings} />;
}
