import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  formatEther,
  isAddress,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Define transaction result type
interface TransactionResult {
  status: "success" | "error" | "pending";
  hash?: string;
  blockNumber?: number;
  message: string;
}

// Configuration
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY || "";
const MAX_ETH_AMOUNT = process.env.NEXT_PUBLIC_MAX_ETH_AMOUNT || "0.05";
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "";

/**
 * Helper function to ensure a string is a valid hex string with 0x prefix
 */
function asHex(value: string): `0x${string}` {
  if (value.startsWith("0x")) {
    return value as `0x${string}`;
  }
  return `0x${value}` as `0x${string}`;
}

/**
 * Check if we have a valid provider configuration
 */
const isProviderConfigured = (): boolean => {
  return !!FAUCET_PRIVATE_KEY && !!RPC_URL;
};

/**
 * Test the provider connection
 */
const testProviderConnection = async (): Promise<boolean> => {
  try {
    if (!RPC_URL) {
      console.error("RPC URL not configured");
      return false;
    }

    // Create a Viem client
    const client = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });

    // Try to get the latest block number
    const blockNumber = await client.getBlockNumber();
    console.log("Viem connection successful, block number:", blockNumber);
    return true;
  } catch (error) {
    console.error("Provider connection test failed:", error);
    return false;
  }
};

/**
 * Send test ETH to a recipient address
 */
const sendTestEther = async (
  recipientAddress: string
): Promise<TransactionResult> => {
  try {
    // Input validation
    if (!isAddress(recipientAddress)) {
      return {
        status: "error",
        message: "Invalid Ethereum address",
      };
    }

    // Check if provider is configured
    if (!isProviderConfigured()) {
      return {
        status: "error",
        message: "Ethereum provider not properly configured",
      };
    }

    if (!RPC_URL) {
      return {
        status: "error",
        message: "RPC URL not configured",
      };
    }

    // Ensure private key has the correct format (add 0x prefix if missing)
    const formattedPrivateKey = asHex(FAUCET_PRIVATE_KEY);

    // Create account from private key
    const account = privateKeyToAccount(formattedPrivateKey);

    // Create public client for reading from the blockchain
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });

    // Create wallet client for sending transactions
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(RPC_URL),
    });

    // Check faucet balance
    const faucetBalance = await publicClient.getBalance({
      address: account.address,
    });

    const etherToSend = parseEther(MAX_ETH_AMOUNT);

    if (faucetBalance < etherToSend) {
      return {
        status: "error",
        message: `Insufficient funds in faucet wallet. Current balance: ${formatEther(
          faucetBalance
        )} ETH`,
      };
    }

    console.log("Sending transaction...");

    // Send the transaction
    const hash = await walletClient.sendTransaction({
      to: asHex(recipientAddress),
      value: etherToSend,
    });

    console.log("Transaction sent:", hash);

    // Return immediately with pending status and hash
    return {
      status: "pending",
      hash: hash,
      message: `Transaction submitted. Sending ${MAX_ETH_AMOUNT} ETH to ${recipientAddress}`,
    };
  } catch (error) {
    console.error("Error sending ETH:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      status: "error",
      message: `Transaction failed: ${errorMessage}`,
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    // Test provider connection first
    const isConnected = await testProviderConnection();
    if (!isConnected) {
      return NextResponse.json(
        {
          error:
            "Could not connect to Ethereum network. Please check your RPC URL.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Ethereum address is required" },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Try to send the transaction
    try {
      const result = await sendTestEther(address);

      if (result.status === "error") {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json(result);
    } catch (txError) {
      console.error("Transaction error:", txError);

      return NextResponse.json(
        {
          error: `Transaction failed: ${
            txError instanceof Error ? txError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Faucet API error:", error);
    return NextResponse.json(
      {
        error: `Failed to process request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
