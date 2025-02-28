"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeLocalStorageSet } from "@/lib/utils";

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

export function PasswordProtection({
  onAuthenticated,
}: PasswordProtectionProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [envError, setEnvError] = useState(false);

  useEffect(() => {
    // Check if the environment variable is set
    if (!process.env.NEXT_PUBLIC_FAUCET_PASSWORD) {
      console.error(
        "NEXT_PUBLIC_FAUCET_PASSWORD environment variable is not set"
      );
      setEnvError(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get the password from environment variable
    const correctPassword = process.env.NEXT_PUBLIC_FAUCET_PASSWORD;

    // If the environment variable is not set, always fail
    if (!correctPassword) {
      setError(true);
      return;
    }

    if (password === correctPassword) {
      // Set authentication in localStorage using the safe utility function
      safeLocalStorageSet("faucet_authenticated", "true");
      onAuthenticated();
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Password Protected
      </h2>

      {envError ? (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p className="font-medium">Configuration Error</p>
          <p className="text-sm">
            The faucet password has not been configured. Please contact the
            administrator.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-center text-muted-foreground">
            This faucet is password protected. Please enter the password to
            continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
