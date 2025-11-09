'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getContract, getCurrentAccount } from '@/lib/web3';
import { uploadToIPFS, getFromIPFS } from '@/lib/ipfs';
import { encryptData, decryptData, generateKeyFromAddress } from '@/lib/encryption';
import AccessControl from '@/components/AccessControl';

export default function UserPortal() {
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
      alert('Please connect wallet and enter record data');
      return;
    }

    try {
      setLoading(true);
      
      const encryptionKey = generateKeyFromAddress(account);
      const encryptedData = encryptData(newRecord.data, encryptionKey);
      const ipfsHash = await uploadToIPFS(encryptedData);
      
      const tx = await contract.createRecord(
        ipfsHash,
        account,
        newRecord.recordType
      );
      
      await tx.wait();
      
      alert('Record created successfully!');
      setNewRecord({ data: '', recordType: 'diagnosis' });
      await loadRecords();
      setActiveTab('records');
    } catch (error: any) {
      console.error('Error creating record:', error);
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
      
      setViewingRecord({
        ...record,
        decryptedData
      });
      setShowModal(true);
    } catch (error: any) {
      console.error('Error viewing record:', error);
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
      diagnosis: '🩺',
      prescription: '💊',
      lab_result: '🧪',
      imaging: '📷',
      other: '📄'
    };
    return icons[type] || '📄';
  };

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      diagnosis: 'bg-blue-500',
      prescription: 'bg-purple-500',
      lab_result: 'bg-green-500',
      imaging: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  if (!account) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-effect rounded-2xl p-12">
            <div className="text-6xl mb-6">👤</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Patient Portal</h2>
            <p className="text-gray-300 mb-8">
              Connect your wallet to access your patient records
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="btn-primary py-4 px-8"
            >
              {loading ? 'Connecting...' : '🔗 Connect Wallet'}
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
            Patient Portal
          </h1>
          <p className="text-gray-400">Manage your medical records securely</p>
        </div>

        {/* Tabs */}
        <div className="glass-effect-strong rounded-2xl p-3 mb-8 flex space-x-3">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'records'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            📋 My Records
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            ➕ Create Record
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'access'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
            }`}
          >
            🔐 Access Control
          </button>
        </div>

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="glass-effect-strong rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Medical Records</h2>
              <div className="text-sm text-gray-400">
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </div>
            </div>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">📭</div>
                <p className="text-gray-400 text-lg mb-2">No records found</p>
                <p className="text-gray-500 text-sm">Create your first record to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500 transition-all card-hover"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`${getRecordTypeColor(record.recordType)} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                        {getRecordTypeIcon(record.recordType)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white capitalize">{record.recordType.replace('_', ' ')}</h3>
                        <p className="text-xs text-gray-400">
                          {new Date(Number(record.timestamp) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewRecord(record)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg disabled:opacity-50"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Record Tab */}
        {activeTab === 'create' && (
          <div className="glass-effect-strong rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Record</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Record Type</label>
                <select
                  value={newRecord.recordType}
                  onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={6}
                />
              </div>
              <button
                onClick={handleCreateRecord}
                disabled={loading || !newRecord.data}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Creating...' : '✨ Create Record'}
              </button>
            </div>
          </div>
        )}

        {/* Access Control Tab */}
        {activeTab === 'access' && (
          <div className="glass-effect-strong rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Access</h2>
            <p className="text-gray-400 mb-6">
              Grant or revoke access to hospitals and insurance providers. You have full control over who can view your records.
            </p>
            <AccessControl onAccessChanged={loadRecords} />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="glass-effect rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`${getRecordTypeColor(viewingRecord.recordType)} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                  {getRecordTypeIcon(viewingRecord.recordType)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white capitalize">{viewingRecord.recordType.replace('_', ' ')}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(Number(viewingRecord.timestamp) * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">Provider</label>
                <p className="text-white font-mono bg-gray-800 p-3 rounded-lg">{viewingRecord.provider}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">Record Data</label>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-white whitespace-pre-wrap">{viewingRecord.decryptedData}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

