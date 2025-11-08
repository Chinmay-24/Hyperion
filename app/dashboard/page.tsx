'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getContract, getCurrentAccount } from '@/lib/web3';
import Link from 'next/link';

export default function Dashboard() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRecords: 0,
    recentRecords: 0,
    providers: 0
  });

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await handleConnect();
      }
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const { address, contract: contractInstance } = await connectWallet();
      setAccount(address);
      setContract(contractInstance);
      await loadStats();
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!contract || !account) return;
    try {
      const recordIds = await contract.getPatientRecords(account);
      setStats({
        totalRecords: recordIds.length,
        recentRecords: recordIds.length, // Simplified
        providers: 0 // Would need to query access list
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!account) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="glass-effect rounded-2xl p-12 max-w-md w-full text-center card-hover">
              <div className="text-6xl mb-6">🔐</div>
              <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-8">
                Connect your MetaMask wallet to access your dashboard
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome to your Hyperion dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Records</p>
                <p className="text-3xl font-bold text-white">{stats.totalRecords}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Providers</p>
                <p className="text-3xl font-bold text-white">{stats.providers}</p>
              </div>
              <div className="text-4xl">🏥</div>
            </div>
          </div>
          <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Access Granted</p>
                <p className="text-3xl font-bold text-white">{stats.recentRecords}</p>
              </div>
              <div className="text-4xl">🔐</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/patient" className="glass-effect rounded-2xl p-8 card-hover block">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">👤</span>
              <h2 className="text-2xl font-bold text-white">Patient Portal</h2>
            </div>
            <p className="text-gray-400 mb-4">
              View and manage your personal health records
            </p>
            <div className="text-purple-400 font-semibold">View Records →</div>
          </Link>

          <Link href="/admin" className="glass-effect rounded-2xl p-8 card-hover block">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">⚙️</span>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Manage records, access controls, and system settings
            </p>
            <div className="text-purple-400 font-semibold">Go to Admin →</div>
          </Link>

          <Link href="/hospital" className="glass-effect rounded-2xl p-8 card-hover block">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">🏥</span>
              <h2 className="text-2xl font-bold text-white">Hospital Integration</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Connect with hospitals and healthcare providers
            </p>
            <div className="text-purple-400 font-semibold">Learn More →</div>
          </Link>

          <Link href="/insurance" className="glass-effect rounded-2xl p-8 card-hover block">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">🛡️</span>
              <h2 className="text-2xl font-bold text-white">Insurance Providers</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Share records securely with insurance companies
            </p>
            <div className="text-purple-400 font-semibold">Get Started →</div>
          </Link>
        </div>
      </div>
    </main>
  );
}

