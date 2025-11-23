import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERC-20 Token Tester",
  description: "Sepolia 테스트용 ERC-20 DApp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
