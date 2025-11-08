'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getContract, getCurrentAccount } from '@/lib/web3';
import { uploadToIPFS, getFromIPFS } from '@/lib/ipfs';
import { encryptData, decryptData, generateKeyFromAddress } from '@/lib/encryption';
import Link from 'next/link';

export default function PatientPortal() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [newRecord, setNewRecord] = useState({
    data: '',
    recordType: 'diagnosis'
  });
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'create' | 'access'>('records');

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
      await loadRecords();
    } catch (error: any) {
      alert('Error connecting wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    if (!contract || !account) return;
    try {
      const recordIds = await contract.getPatientRecords(account);
      const recordsData = [];
      for (const id of recordIds) {
        const record = await contract.getRecord(id);
        recordsData.push({
          id: id.toString(),
          ...record
        });
      }
      setRecords(recordsData);
    } catch (error: any) {
      console.error('Error loading records:', error);
    }
  };

  const handleCreateRecord = async () => {
    if (!contract || !account || !newRecord.data) {
      alert('Please enter record data');
      return;
    }
    try {
      setLoading(true);
      const encryptionKey = generateKeyFromAddress(account);
      const encryptedData = encryptData(newRecord.data, encryptionKey);
      const ipfsHash = await uploadToIPFS(encryptedData);
      const tx = await contract.createRecord(ipfsHash, account, newRecord.recordType);
      await tx.wait();
      alert('Record created successfully!');
      setNewRecord({ data: '', recordType: 'diagnosis' });
      await loadRecords();
      setActiveTab('records');
    } catch (error: any) {
      alert('Error creating record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = async (record: any) => {
    if (!account) return;
    try {
      setLoading(true);
      const encryptedData = await getFromIPFS(record.ipfsHash);
      const encryptedString = encryptedData.toString();
      const encryptionKey = generateKeyFromAddress(account);
      const decryptedData = decryptData(encryptedString, encryptionKey);
      setViewingRecord({ ...record, decryptedData });
      setShowModal(true);
    } catch (error: any) {
      alert('Error viewing record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRecordTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      diagnosis: '🩺', prescription: '💊', lab_result: '🧪', imaging: '📷', other: '📄'
    };
    return icons[type] || '📄';
  };

  if (!account) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="glass-effect rounded-2xl p-12 max-w-md w-full text-center card-hover">
              <div className="text-6xl mb-6">🔐</div>
              <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
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
          <h1 className="text-4xl font-bold text-white mb-2">Patient Portal</h1>
          <p className="text-gray-400">Manage your health records securely</p>
        </div>

        {/* Tabs */}
        <div className="glass-effect rounded-2xl p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'records' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 My Records
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'create' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            ➕ Create Record
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'access' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔐 Access Control
          </button>
        </div>

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Medical Records</h2>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">📭</div>
                <p className="text-gray-400 text-lg mb-2">No records found</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Create your first record →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500 transition-all card-hover"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-3xl">{getRecordTypeIcon(record.recordType)}</div>
                      <div>
                        <h3 className="font-bold text-white capitalize">{record.recordType.replace('_', ' ')}</h3>
                        <p className="text-xs text-gray-400">
                          {new Date(Number(record.timestamp) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewRecord(record)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Record</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Record Type</label>
                <select
                  value={newRecord.recordType}
                  onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                >
                  <option value="diagnosis">🩺 Diagnosis</option>
                  <option value="prescription">💊 Prescription</option>
                  <option value="lab_result">🧪 Lab Result</option>
                  <option value="imaging">📷 Imaging</option>
                  <option value="other">📄 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Record Information</label>
                <textarea
                  value={newRecord.data}
                  onChange={(e) => setNewRecord({ ...newRecord, data: e.target.value })}
                  placeholder="Enter patient record information..."
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none"
                  rows={8}
                />
              </div>
              <button
                onClick={handleCreateRecord}
                disabled={loading || !newRecord.data}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating...' : '✨ Create Record'}
              </button>
            </div>
          </div>
        )}

        {/* Access Control Tab */}
        {activeTab === 'access' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Access</h2>
            <p className="text-gray-400 mb-6">
              Grant or revoke access to hospitals and healthcare providers
            </p>
            <Link
              href="/admin"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Go to Access Control →
            </Link>
          </div>
        )}

        {/* Modal */}
        {showModal && viewingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
            <div className="glass-effect rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white capitalize">{viewingRecord.recordType.replace('_', ' ')}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-400 mb-2 block">Record Data</label>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-white whitespace-pre-wrap">{viewingRecord.decryptedData}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

