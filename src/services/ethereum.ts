import { ethers } from "ethers";

export type TransactionStatus = "pending" | "mining" | "success" | "error";

export interface TransactionReceipt {
  status: TransactionStatus;
  hash?: string;
  message?: string;
  blockNumber?: number;
}

// Sepolia testnet configuration
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "";
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY || "";
const DEFAULT_ETH_AMOUNT = process.env.NEXT_PUBLIC_MAX_ETH_AMOUNT || "0.05"; // Default amount to send (in ETH)

// Debug logs (will only show in server console)
console.log("ENV Check - RPC URL configured:", !!SEPOLIA_RPC_URL);
console.log("ENV Check - Private key configured:", !!FAUCET_PRIVATE_KEY);

/**
 * Check if we have a valid provider configuration
 */
export const isProviderConfigured = (): boolean => {
  return !!FAUCET_PRIVATE_KEY && !!SEPOLIA_RPC_URL;
};

/**
 * Get a provider instance for the Sepolia testnet
 */
const getProvider = (): ethers.providers.JsonRpcProvider => {
  if (!SEPOLIA_RPC_URL) {
    throw new Error("Sepolia RPC URL not configured");
  }
  return new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
};

/**
 * Get a wallet instance configured with the faucet's private key
 */
const getWallet = (): ethers.Wallet => {
  if (!FAUCET_PRIVATE_KEY) {
    throw new Error("Faucet private key not configured");
  }

  const provider = getProvider();
  return new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);
};

/**
 * Get the balance of the faucet wallet
 */
export const getFaucetBalance = async (): Promise<string> => {
  try {
    const wallet = getWallet();
    const balance = await wallet.getBalance();
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting faucet balance:", error);
    return "0";
  }
};

/**
 * Send test ETH to a recipient address
 * @param recipientAddress The Ethereum address to receive test ETH
 * @param amount The amount of ETH to send (defaults to DEFAULT_ETH_AMOUNT)
 * @param statusCallback Optional callback to receive transaction status updates
 */
export const sendTestEther = async (
  recipientAddress: string,
  amount = DEFAULT_ETH_AMOUNT,
  statusCallback?: (status: TransactionReceipt) => void
): Promise<TransactionReceipt> => {
  // Initial status
  const updateStatus = (status: TransactionReceipt) => {
    if (statusCallback) {
      statusCallback(status);
    }
    return status;
  };

  try {
    // Input validation
    if (!ethers.utils.isAddress(recipientAddress)) {
      return updateStatus({
        status: "error",
        message: "Invalid Ethereum address",
      });
    }

    // Check if provider is configured
    if (!isProviderConfigured()) {
      return updateStatus({
        status: "error",
        message: "Ethereum provider not properly configured",
      });
    }

    // Get wallet
    const wallet = getWallet();

    // Check faucet balance
    const faucetBalance = await wallet.getBalance();
    const etherToSend = ethers.utils.parseEther(amount);

    if (faucetBalance.lt(etherToSend)) {
      return updateStatus({
        status: "error",
        message: "Insufficient funds in faucet wallet",
      });
    }

    // Create transaction
    updateStatus({
      status: "pending",
      message: "Preparing transaction...",
    });

    // Send the transaction
    const tx = await wallet.sendTransaction({
      to: recipientAddress,
      value: etherToSend,
    });

    updateStatus({
      status: "mining",
      hash: tx.hash,
      message: "Transaction submitted and waiting for confirmation...",
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    return updateStatus({
      status: "success",
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      message: `Successfully sent ${amount} ETH to ${recipientAddress}`,
    });
  } catch (error) {
    console.error("Error sending ETH:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return updateStatus({
      status: "error",
      message: `Transaction failed: ${errorMessage}`,
    });
  }
};

/**
 * Get ETH balance for a given address
 * @param address The Ethereum address to check
 */
export const getAddressBalance = async (address: string): Promise<string> => {
  try {
    if (!ethers.utils.isAddress(address)) {
      throw new Error("Invalid Ethereum address");
    }

    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting address balance:", error);
    throw error;
  }
};

/**
 * Check if an address has received ETH in the last 24 hours
 * This is a simplified implementation that would need to be enhanced with a database
 * to track addresses that have received ETH.
 * @param address The Ethereum address to check
 */
export const hasRecentlyRequestedEth = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _address: string
): Promise<boolean> => {
  // In a real implementation, you would check a database to see if this address
  // has received ETH recently
  // For now, we'll return false to allow testing
  return false;
};
