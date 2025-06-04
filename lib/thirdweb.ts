import { createThirdwebClient, defineChain } from "thirdweb";
import { avalanche } from "thirdweb/chains";

export const chain = defineChain( avalanche ); // Or use Avalanche Fuji for testnet
export const client = createThirdwebClient({
  clientId: "42b826ce4c0853db0413459003bbeff7", // your client ID
});
