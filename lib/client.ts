// lib/client.ts

import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
const secretKey = process.env.TW_SECRET_KEY;

if (!clientId && !secretKey) {
  throw new Error("Neither Client ID nor Secret Key is set in environment variables.");
}

// Prefer secretKey in backend/server-side contexts
const client = createThirdwebClient(
  secretKey ? { secretKey } : { clientId: clientId! }
);

export default client;
