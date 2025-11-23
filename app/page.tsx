"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";

// 1. WalletConnect Cloud 프로젝트 ID (무료 발급)
const projectId = "7069090d9648e5f70ea16b448364de30"; // 아래 링크에서 10초만에 발급 → https://cloud.walletconnect.com

// 2. 지원할 체인 (Sepolia 테스트넷)
const sepolia = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://rpc.sepolia.org",
};

const metadata = {
  name: "ERC20 Tester",
  description: "ERC-20 토큰 테스트 DApp",
  url: "https://erc20-tester.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [sepolia],
  projectId,
  enableAnalytics: false,
});

export default function Home() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [balance, setBalance] = useState<string>("0");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  // 여러분이 Sepolia에 배포한 ERC20 컨트랙트 주소와 ABI
  const CONTRACT_ADDRESS = "0xYourTokenAddressHere"; // ← 여기만 바꾸세요!
  const CONTRACT_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
  ];

  useEffect(() => {
    if (isConnected && walletProvider) {
      loadBalance();
    }
  }, [address, isConnected, walletProvider]);

  const loadBalance = async () => {
    if (!walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const bal = await contract.balanceOf(address);
    setBalance(ethers.formatEther(bal));
  };

  const transfer = async () => {
    if (!walletProvider || !to || !amount) return;
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.transfer(to, ethers.parseEther(amount));
    await tx.wait();
    alert("전송 성공!");
    loadBalance();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 max-w-md w-full shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">ERC-20 Tester</h1>

        {!isConnected ? (
          <button
            onClick={() => open()}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-xl hover:scale-105 transition"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/20 rounded-xl p-6 text-white">
              <p className="text-sm opacity-80">지갑 주소</p>
              <p className="font-mono text-lg break-all">{address}</p>
            </div>

            <div className="bg-white/20 rounded-xl p-6 text-white">
              <p className="text-sm opacity-80">토큰 잔액</p>
              <p className="text-3xl font-bold">{Number(balance).toFixed(4)} TCOIN</p>
            </div>

            <div className="space-y-4">
              <input
                placeholder="받는 주소 (0x...)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none"
              />
              <input
                placeholder="보낼 금액"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none"
              />
              <button
                onClick={transfer}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition"
              >
                Send Tokens
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
