'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getContract } from '@/lib/web3';

export default function AdminPortal() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalPatients: 0,
    totalProviders: 0,
    networkHealth: 'Good'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'monitoring' | 'settings'>('dashboard');

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
      alert('Error connecting wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!contract) return;
    try {
      const totalRecords = await contract.totalRecords();
      setStats({
        totalRecords: Number(totalRecords),
        totalPatients: 0, // Would need additional contract methods
        totalProviders: 0,
        networkHealth: 'Good'
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!account) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-effect rounded-2xl p-12">
            <div className="text-6xl mb-6">⚙️</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Admin Portal</h2>
            <p className="text-gray-300 mb-8">
              Connect your admin wallet to access system controls
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Admin Wallet'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-gray-400">System administration and monitoring</p>
        </div>

        {/* Tabs */}
        <div className="glass-effect rounded-xl p-2 mb-6 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            👥 User Management
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'monitoring'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📡 Network Monitoring
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-effect rounded-xl p-6 card-hover">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalRecords}</div>
                <div className="text-sm text-gray-400">Total Records</div>
              </div>
              <div className="glass-effect rounded-xl p-6 card-hover">
                <div className="text-3xl mb-2">👤</div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalPatients}</div>
                <div className="text-sm text-gray-400">Total Patients</div>
              </div>
              <div className="glass-effect rounded-xl p-6 card-hover">
                <div className="text-3xl mb-2">🏥</div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalProviders}</div>
                <div className="text-sm text-gray-400">Providers</div>
              </div>
              <div className="glass-effect rounded-xl p-6 card-hover">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-xl font-bold text-green-400 mb-1">{stats.networkHealth}</div>
                <div className="text-sm text-gray-400">Network Status</div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">System Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Blockchain Network</span>
                  <span className="text-green-400 font-semibold">● Active</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">IPFS Storage</span>
                  <span className="text-green-400 font-semibold">● Connected</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Encryption Status</span>
                  <span className="text-green-400 font-semibold">● Enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400">
                  User management features would be implemented here. This could include:
                </p>
                <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
                  <li>View all registered users (patients, hospitals, insurance providers)</li>
                  <li>Manage user roles and permissions</li>
                  <li>Monitor user activity and access logs</li>
                  <li>Suspend or revoke user access if needed</li>
                  <li>View audit trails for compliance</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Network Monitoring</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Real-time Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Transactions/Hour</div>
                    <div className="text-2xl font-bold text-white">0</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Active Connections</div>
                    <div className="text-2xl font-bold text-white">0</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                <p className="text-gray-400">Activity logs would appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Configuration</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Maintenance Mode</span>
                    <button className="bg-gray-700 px-4 py-2 rounded-lg text-white">Disabled</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Auto Backup</span>
                    <button className="bg-green-600 px-4 py-2 rounded-lg text-white">Enabled</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
