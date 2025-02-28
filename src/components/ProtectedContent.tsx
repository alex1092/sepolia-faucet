"use client";

import { FaucetForm } from "@/components/FaucetForm";
import { PasswordProtection } from "@/components/PasswordProtection";
import { useEffect, useState } from "react";
import { safeLocalStorageGet } from "@/lib/utils";

export function ProtectedContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated using the safe utility function
    const authenticated =
      safeLocalStorageGet("faucet_authenticated") === "true";
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return isAuthenticated ? (
    <FaucetForm />
  ) : (
    <PasswordProtection onAuthenticated={handleAuthenticated} />
  );
}
