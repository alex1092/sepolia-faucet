import { FaucetForm } from "@/components/FaucetForm";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto flex flex-col gap-8 items-center">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-4">Sepolia Testnet Faucet</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get test ETH for development and testing on the Ethereum Sepolia
            testnet
          </p>
        </div>
        <FaucetForm />
      </main>
    </div>
  );
}
