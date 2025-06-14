"use client";

import { useContractEvents } from "thirdweb/react";
import { transferEvent } from "thirdweb/extensions/erc721";
import { NFT_COLLECTION } from "@/const/contracts";
import Link from "next/link";
import { avalanche } from "thirdweb/chains";
import client from "@/lib/client";
import { getContract } from "thirdweb";

export default function Events({ tokenId }: { tokenId: bigint }) {
  const { data: transferEvents } = useContractEvents({
    contract: getContract({
      address: NFT_COLLECTION,
      chain: avalanche,
      client: client,
    }),
    events: [transferEvent({ tokenId })],
  });

  return (
    <div className="flex flex-col flex-wrap gap-4 mt-3 divide-y">
      {transferEvents?.map((event) => (
        <div
          key={event.transactionHash}
          className="flex justify-between items-center flex-1 gap-1 border-white/20 py-2 min-w-[128px] min-h-[32px]"
        >
          <div className="flex flex-col gap-1">
            <p className="text-white/60">Event</p>
            <p className="font-semibold text-white">Transfer</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-white/60">From</p>
            <p className="font-semibold text-white">
              {event.args.from.slice(0, 4)}...{event.args.from.slice(-2)}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-white/60">To</p>
            <p className="font-semibold text-white">
              {event.args.to.slice(0, 4)}...{event.args.to.slice(-2)}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Link
              className="w-6 h-6 p-2"
              href={`https://snowtrace.io/tx/${event.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
