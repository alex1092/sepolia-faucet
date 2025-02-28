import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <h1 className="text-xl font-bold tracking-tight">Sepolia Testnet Faucet</h1>
          </Link>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

