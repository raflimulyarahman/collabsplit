import "./globals.css";
import { WalletProvider } from "@mysten/wallet-kit";

export const metadata = {
  title: "CollabSplit - Web3 Revenue Sharing Platform",
  description: "Transparent and automated revenue sharing for creator collaborations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}