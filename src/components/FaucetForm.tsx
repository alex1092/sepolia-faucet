"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define transaction types
type TransactionStatus = "pending" | "mining" | "success" | "error";

interface TransactionReceipt {
  status: TransactionStatus;
  hash?: string;
  message?: string;
  blockNumber?: number;
}

// Define the form schema with validation
const formSchema = z.object({
  address: z
    .string()
    .min(1, { message: "Ethereum address is required" })
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function FaucetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [txReceipt, setTxReceipt] = useState<TransactionReceipt | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Reset states
      setIsLoading(true);
      setTxReceipt(null);

      // Initialize toast
      toast.loading("Initiating transaction...", {
        id: "eth-transaction",
      });

      // Update status to pending
      setTxReceipt({
        status: "pending",
        message: "Preparing transaction...",
      });

      // Create an AbortController for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        // Call the server API endpoint
        const response = await fetch("/api/faucet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: values.address }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          let errorMessage = "Failed to send ETH";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use status text
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }

          toast.error("Transaction failed", {
            id: "eth-transaction",
            description: errorMessage,
          });

          setTxReceipt({
            status: "error",
            message: errorMessage,
          });

          setIsLoading(false);
          return;
        }

        // Parse the JSON response
        const result = await response.json();

        // Update UI with pending transaction
        setTxReceipt({
          status: "pending",
          hash: result.hash,
          message:
            result.message ||
            "Transaction submitted, waiting for confirmation...",
        });

        toast.loading("Transaction submitted", {
          id: "eth-transaction",
          description: "Waiting for confirmation...",
        });

        // If we have a transaction hash, start polling for status
        if (result.hash) {
          await pollTransactionStatus(result.hash);
        } else {
          // No hash means something went wrong
          toast.error("Transaction error", {
            id: "eth-transaction",
            description: "No transaction hash returned",
          });

          setTxReceipt({
            status: "error",
            message: "No transaction hash returned",
          });

          setIsLoading(false);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Handle fetch errors (including timeout)
        const errorMessage =
          fetchError instanceof Error
            ? fetchError.name === "AbortError"
              ? "Request timed out. The network might be congested or the RPC endpoint is unresponsive."
              : fetchError.message
            : "Unknown error occurred";

        console.error("Fetch error:", fetchError);

        toast.error("Transaction request failed", {
          id: "eth-transaction",
          description: errorMessage,
        });

        setTxReceipt({
          status: "error",
          message: errorMessage,
        });

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Faucet request failed:", error);

      toast.error("Unexpected error", {
        id: "eth-transaction",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });

      setTxReceipt({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });

      setIsLoading(false);
    }
  };

  // Poll for transaction status
  const pollTransactionStatus = async (hash: string) => {
    let attempts = 0;
    const maxAttempts = 20; // Maximum polling attempts
    const pollInterval = 5000; // 5 seconds between polls

    const checkStatus = async () => {
      try {
        const response = await fetch("/api/transaction-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hash }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "success") {
          // Transaction confirmed
          toast.success("Transaction successful!", {
            id: "eth-transaction",
            description:
              "Your transaction has been confirmed on the blockchain.",
          });

          setTxReceipt({
            status: "success",
            hash: result.hash,
            message: "ETH successfully sent to your address!",
            blockNumber: result.blockNumber,
          });

          setIsLoading(false);
          form.reset();
          return true;
        }

        // Still pending, continue polling if under max attempts
        attempts++;
        if (attempts >= maxAttempts) {
          // Too many attempts, but transaction might still be pending
          toast.info("Transaction pending", {
            id: "eth-transaction",
            description:
              "Your transaction is still pending. You can check its status on Etherscan.",
          });

          setTxReceipt({
            status: "pending",
            hash: hash,
            message:
              "Transaction is still pending. Check Etherscan for updates.",
          });

          setIsLoading(false);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error polling transaction status:", error);

        // Continue polling on error
        attempts++;
        if (attempts >= maxAttempts) {
          toast.error("Status check failed", {
            id: "eth-transaction",
            description:
              "Could not verify transaction status. Please check Etherscan.",
          });

          setTxReceipt({
            status: "pending",
            hash: hash,
            message: "Transaction status unknown. Please check Etherscan.",
          });

          setIsLoading(false);
          return true;
        }

        return false;
      }
    };

    // Start polling
    const poll = async () => {
      const done = await checkStatus();
      if (!done) {
        setTimeout(poll, pollInterval);
      }
    };

    await poll();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sepolia Testnet Faucet</CardTitle>
        <CardDescription>
          Request test ETH for your Sepolia address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ethereum Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your Sepolia testnet address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? txReceipt?.status === "mining"
                  ? "Transaction Mining..."
                  : "Processing..."
                : "Request 0.05 ETH"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-center text-sm text-muted-foreground">
        {txReceipt && (
          <div className="w-full mb-4">
            {txReceipt.status === "success" && (
              <div className="text-green-500 font-medium">
                <p>ETH successfully sent to your address!</p>
                {txReceipt.hash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txReceipt.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-blue-500 hover:text-blue-700"
                  >
                    View on Etherscan
                  </a>
                )}
              </div>
            )}

            {txReceipt.status === "error" && (
              <p className="text-red-500 font-medium">
                {txReceipt.message ||
                  "Failed to send ETH. Please try again later."}
              </p>
            )}

            {txReceipt.status === "pending" && (
              <div className="text-yellow-500 font-medium">
                <p>Preparing transaction...</p>
              </div>
            )}

            {txReceipt.status === "mining" && (
              <div className="text-yellow-500 font-medium">
                <p>Transaction in progress...</p>
                {txReceipt.hash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txReceipt.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-blue-500 hover:text-blue-700"
                  >
                    View on Etherscan
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
