import { ConnectButton } from "thirdweb/react";
import Image from "next/image";
import Link from "next/link";
import client from "@/lib/client";
import { avalanche } from "thirdweb/chains";

export function Navbar() {
  return (
    <div className="fixed top-0 z-10 flex items-center justify-center w-full bg-gradient-to-b from-yellow-300 to-orange-400 text-black backdrop-blur-md">
      <nav className="flex items-center justify-between w-full px-8 py-5 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="mr-4">
            <Image
              src="/ig-brap-logo.png"
              width={48}
              height={48}
              alt="NFT marketplace sample logo"
            />
          </Link>

          <div className="flex items-center gap-6 font-medium">
            <Link
              href="/buy"
              className="transition-colors hover:text-orange-500 text-black"
            >
              Buy
            </Link>
            <Link
              href="/sell"
              className="transition-colors hover:text-orange-500 text-black"
            >
              Sell
            </Link>
            <Link
              href="/stake"
              className="transition-colors hover:text-orange-500 text-black"
            >
              Stake
            </Link>
            {/* Buy BRAP Token link has been removed */}
            <Link
              href="/brap-roadmap"
              className="transition-colors hover:text-orange-500 text-black"
            >
              The Brap Road Map
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <ConnectButton
            theme="dark"
            client={client}
            chain={avalanche}
          />
        </div>
      </nav>
    </div>
  );
}