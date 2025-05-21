import { createThirdwebClient } from "thirdweb";

// Read client ID and secret key from environment variables
const clientId = process.env.NEXT_PUBLIC_TW_CLIENT_ID;
const secretKey = process.env.TW_SECRET_KEY;

// Throw an error if neither variable is set
if (!clientId && !secretKey) {
  throw new Error("Neither Client ID nor Secret Key is set in environment variables.");
}

// Prefer secretKey for backend usage, otherwise use clientId for frontend
const client = createThirdwebClient(
  secretKey ? { secretKey } : { clientId: clientId! }
);

export default client;