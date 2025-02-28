import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

// Configuration
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash } = body;

    if (!hash) {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 }
      );
    }

    if (!RPC_URL) {
      return NextResponse.json(
        { error: "RPC URL not configured" },
        { status: 500 }
      );
    }

    // Create public client for reading from the blockchain
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });

    try {
      // Check if transaction is mined
      const receipt = await publicClient.getTransactionReceipt({ hash });

      if (receipt) {
        return NextResponse.json({
          status: "success",
          hash: receipt.transactionHash,
          blockNumber: Number(receipt.blockNumber),
          message: "Transaction successfully mined",
        });
      }

      // Transaction is still pending
      return NextResponse.json({
        status: "pending",
        hash: hash,
        message: "Transaction is still pending",
      });
    } catch (error) {
      console.error("Error checking transaction status:", error);

      // If we can't get the receipt, the transaction might be pending or not found
      return NextResponse.json({
        status: "pending",
        hash: hash,
        message: "Transaction status unknown, it may still be pending",
      });
    }
  } catch (error) {
    console.error("Transaction status API error:", error);
    return NextResponse.json(
      {
        error: `Failed to check transaction status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
