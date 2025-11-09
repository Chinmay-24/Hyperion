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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="text-7xl md:text-9xl animate-float">⚡</div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text">
              Hyperion
            </h1>
            <p className="text-2xl md:text-3xl text-gray-200 mb-4 font-semibold">
              Decentralized Patient Records System
            </p>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Secure, private, and blockchain-powered healthcare record management.
              Connecting patients, hospitals, and insurance providers on a decentralized network.
            </p>

            {!account ? (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="btn-primary text-lg py-4 px-10 animate-glow"
              >
                {loading ? 'Connecting...' : '🔗 Connect Wallet to Get Started'}
              </button>
            ) : (
              <div className="inline-flex items-center space-x-3 glass-effect px-8 py-4 rounded-2xl animate-glow">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-mono text-lg">{formatAddress(account)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-5xl font-bold text-center mb-16 gradient-text">Choose Your Portal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Patient Portal */}
          <Link href="/user" className="glass-effect-strong rounded-3xl p-8 card-hover text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-300">👤</div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">Patient Portal</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Access and manage your medical records securely. View your health history, grant access to providers, and maintain full control of your data.
              </p>
              <div className="text-blue-400 font-bold group-hover:text-blue-300 flex items-center justify-center gap-2">
                Enter Portal <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Hospital Portal */}
          <Link href="/hospital" className="glass-effect-strong rounded-3xl p-8 card-hover text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-300">🏥</div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">Hospital Portal</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Healthcare providers can create, update, and access patient records with proper authorization. Streamline medical workflows.
              </p>
              <div className="text-green-400 font-bold group-hover:text-green-300 flex items-center justify-center gap-2">
                Enter Portal <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Insurance Portal */}
          <Link href="/insurance" className="glass-effect-strong rounded-3xl p-8 card-hover text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-300">🛡️</div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">Insurance Portal</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Insurance providers can verify claims, access authorized records, and process reimbursements efficiently and securely.
              </p>
              <div className="text-yellow-400 font-bold group-hover:text-yellow-300 flex items-center justify-center gap-2">
                Enter Portal <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link href="/admin" className="glass-effect-strong rounded-3xl p-8 card-hover text-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-300">⚙️</div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">Admin Portal</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                System administrators can manage users, monitor network activity, and maintain the decentralized healthcare ecosystem.
              </p>
              <div className="text-purple-400 font-bold group-hover:text-purple-300 flex items-center justify-center gap-2">
                Enter Portal <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-5xl font-bold text-center mb-16 gradient-text">Why Hyperion?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="glass-effect-strong rounded-3xl p-8 card-hover group">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">End-to-End Encryption</h3>
            <p className="text-gray-300 leading-relaxed">
              All patient data is encrypted before storage. Only authorized parties with proper access can decrypt and view records.
            </p>
          </div>
          <div className="glass-effect-strong rounded-3xl p-8 card-hover group">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🌐</div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">Decentralized Network</h3>
            <p className="text-gray-300 leading-relaxed">
              No single point of failure. Data is stored on IPFS and blockchain, ensuring availability and immutability.
            </p>
          </div>
          <div className="glass-effect-strong rounded-3xl p-8 card-hover group">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors">Access Control</h3>
            <p className="text-gray-300 leading-relaxed">
              Patients have full control over who can access their records. Grant or revoke access to hospitals and insurance providers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
