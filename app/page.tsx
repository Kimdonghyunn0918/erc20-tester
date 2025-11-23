"use client";

import { useState, useEffect } from "react";
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ethers } from 'ethers';
import { http } from 'viem';

// 1. WalletConnect Project ID
const projectId = "7069090d9648e5f70ea16b448364de30"; // https://cloud.walletconnect.com

// 2. Wagmi + AppKit 설정
const queryClient = new QueryClient();
const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId,
  ssr: true,
});
const metadata = {
  name: "ERC20 Tester",
  description: "ERC-20 Token Test DApp",
  url: "https://erc20-tester.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  metadata,
  projectId,
});

export default function Home() {
  const [balance, setBalance] = useState("0");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");

  // AppKit 훅으로 연결 상태 가져오기
  useEffect(() => {
    wagmiAdapter.wagmiConfig.data?.state?.connection?.status === 'connected' ? setIsConnected(true) : setIsConnected(false);
    if (wagmiAdapter.wagmiConfig.data?.state?.connection?.accounts[0]) {
      setAddress(wagmiAdapter.wagmiConfig.data.state.connection.accounts[0]);
      loadBalance(wagmiAdapter.wagmiConfig.data.state.connection.accounts[0]);
    }
  }, []);

  const loadBalance = async (userAddress: string) => {
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const bal = await contract.balanceOf(userAddress);
    setBalance(ethers.formatEther(bal));
  };

  const transfer = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.transfer(to, ethers.parseEther(amount));
    await tx.wait();
    alert("전송 완료!");
    loadBalance(address);
  };

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 max-w-md w-full shadow-2xl">
            <h1 className="text-4xl font-bold text-white text-center mb-8">ERC-20 Tester</h1>

            {!isConnected ? (
              <button
                onClick={() => wagmiAdapter.open()}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-xl hover:scale-105 transition"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/20 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-80">Address</p>
                  <p className="font-mono text-lg break-all">{address}</p>
                </div>

                <div className="bg-white/20 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-80">Balance</p>
                  <p className="text-3xl font-bold">{Number(balance).toFixed(4)} TCOIN</p>
                </div>

                <div className="space-y-4">
                  <input
                    placeholder="To Address"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60"
                  />
                  <input
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60"
                  />
                  <button onClick={transfer} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl">
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// 컨트랙트 설정 (아래와 같음)
const CONTRACT_ADDRESS = "0xYourAddress";
const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  // ... 나머지 ABI
];
