import { WalletConnectButton } from "@mysten/wallet-kit";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold">
        Welcome to CollabSplit
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Transparent revenue sharing for creator collaborations
      </p>
      <WalletConnectButton />
    </div>
  );
}