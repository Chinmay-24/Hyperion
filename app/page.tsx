'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { connectWallet, getCurrentAccount } from '@/lib/web3';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const { address } = await connectWallet();
      setAccount(address);
    } catch (error: any) {
      alert('Error connecting wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Hyperion
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-4">
              Decentralized Patient Records System
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Secure, private, and blockchain-powered healthcare record management.
              Connecting patients, hospitals, and insurance providers on a decentralized network.
            </p>

            {!account ? (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? 'Connecting...' : 'Connect Wallet to Get Started'}
              </button>
            ) : (
              <div className="inline-flex items-center space-x-3 bg-gray-800/50 px-6 py-3 rounded-xl">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-mono">{formatAddress(account)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">Choose Your Portal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Patient Portal */}
          <Link href="/user" className="glass-effect rounded-2xl p-8 card-hover text-center group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👤</div>
            <h3 className="text-2xl font-bold text-white mb-3">Patient Portal</h3>
            <p className="text-gray-400 mb-6">
              Access and manage your medical records securely. View your health history, grant access to providers, and maintain full control of your data.
            </p>
            <div className="text-blue-400 font-semibold group-hover:text-blue-300">
              Enter Portal →
            </div>
          </Link>

          {/* Hospital Portal */}
          <Link href="/hospital" className="glass-effect rounded-2xl p-8 card-hover text-center group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏥</div>
            <h3 className="text-2xl font-bold text-white mb-3">Hospital Portal</h3>
            <p className="text-gray-400 mb-6">
              Healthcare providers can create, update, and access patient records with proper authorization. Streamline medical workflows.
            </p>
            <div className="text-blue-400 font-semibold group-hover:text-blue-300">
              Enter Portal →
            </div>
          </Link>

          {/* Insurance Portal */}
          <Link href="/insurance" className="glass-effect rounded-2xl p-8 card-hover text-center group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
            <h3 className="text-2xl font-bold text-white mb-3">Insurance Portal</h3>
            <p className="text-gray-400 mb-6">
              Insurance providers can verify claims, access authorized records, and process reimbursements efficiently and securely.
            </p>
            <div className="text-blue-400 font-semibold group-hover:text-blue-300">
              Enter Portal →
            </div>
          </Link>

          {/* Admin Portal */}
          <Link href="/admin" className="glass-effect rounded-2xl p-8 card-hover text-center group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
            <h3 className="text-2xl font-bold text-white mb-3">Admin Portal</h3>
            <p className="text-gray-400 mb-6">
              System administrators can manage users, monitor network activity, and maintain the decentralized healthcare ecosystem.
            </p>
            <div className="text-blue-400 font-semibold group-hover:text-blue-300">
              Enter Portal →
            </div>
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">Why Hyperion?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
            <p className="text-gray-400">
              All patient data is encrypted before storage. Only authorized parties with proper access can decrypt and view records.
            </p>
          </div>
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-white mb-3">Decentralized Network</h3>
            <p className="text-gray-400">
              No single point of failure. Data is stored on IPFS and blockchain, ensuring availability and immutability.
            </p>
          </div>
          <div className="glass-effect rounded-2xl p-6">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-3">Access Control</h3>
            <p className="text-gray-400">
              Patients have full control over who can access their records. Grant or revoke access to hospitals and insurance providers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
