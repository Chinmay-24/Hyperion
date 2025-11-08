'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getContract } from '@/lib/web3';
import { getFromIPFS } from '@/lib/ipfs';
import { decryptData, generateKeyFromAddress } from '@/lib/encryption';

export default function InsurancePortal() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [patientAddress, setPatientAddress] = useState('');
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'verify' | 'claims' | 'reports'>('verify');

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
    } catch (error: any) {
      alert('Error connecting wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPatient = async () => {
    if (!contract || !patientAddress) {
      alert('Please enter patient address');
      return;
    }

    try {
      setLoading(true);
      const recordIds = await contract.getPatientRecords(patientAddress);
      const recordsData = [];
      
      for (const id of recordIds) {
        try {
          const record = await contract.getRecord(id);
          recordsData.push({
            id: id.toString(),
            ...record
          });
        } catch (error) {
          // Record might not be accessible
          console.log('Cannot access record:', id);
        }
      }
      
      setPatientRecords(recordsData);
    } catch (error: any) {
      console.error('Error verifying patient:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = async (record: any) => {
    if (!patientAddress) return;
    
    try {
      setLoading(true);
      const encryptedData = await getFromIPFS(record.ipfsHash);
      const encryptedString = encryptedData.toString();
      const encryptionKey = generateKeyFromAddress(patientAddress);
      const decryptedData = decryptData(encryptedString, encryptionKey);
      
      setSelectedRecord({
        ...record,
        decryptedData
      });
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

  if (!account) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-effect rounded-2xl p-12">
            <div className="text-6xl mb-6">🛡️</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Insurance Provider Portal</h2>
            <p className="text-gray-300 mb-8">
              Connect your insurance provider wallet to verify claims and access authorized records
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Insurance Wallet'}
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
            Insurance Provider Portal
          </h1>
          <p className="text-gray-400">Verify claims and access authorized patient records</p>
        </div>

        {/* Tabs */}
        <div className="glass-effect rounded-xl p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'verify'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            ✅ Verify Claims
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'claims'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📋 Claims Processing
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Reports
          </button>
        </div>

        {/* Verify Claims Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Verify Patient Records</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Patient Wallet Address
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleVerifyPatient}
                      disabled={loading || !patientAddress}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter patient address to verify their medical records (requires patient authorization)
                  </p>
                </div>
              </div>
            </div>

            {patientRecords.length > 0 && (
              <div className="glass-effect rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Accessible Records</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patientRecords.map((record) => (
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
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg disabled:opacity-50"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRecord && (
              <div className="glass-effect rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Record Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-400 mb-2 block">Record Type</label>
                    <p className="text-white capitalize">{selectedRecord.recordType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-400 mb-2 block">Provider</label>
                    <p className="text-white font-mono">{formatAddress(selectedRecord.provider)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-400 mb-2 block">Date</label>
                    <p className="text-white">
                      {new Date(Number(selectedRecord.timestamp) * 1000).toLocaleString()}
                    </p>
                  </div>
                  {selectedRecord.decryptedData && (
                    <div>
                      <label className="text-sm font-semibold text-gray-400 mb-2 block">Record Data</label>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-white whitespace-pre-wrap">{selectedRecord.decryptedData}</p>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {/* Claims Processing Tab */}
        {activeTab === 'claims' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Claims Processing</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <p className="text-gray-400 mb-4">
                Claims processing dashboard would include:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Pending claims requiring verification</li>
                <li>Verified claims ready for processing</li>
                <li>Reimbursement calculations based on verified records</li>
                <li>Approval/rejection workflow</li>
                <li>Payment processing integration</li>
              </ul>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reports & Analytics</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <p className="text-gray-400 mb-4">
                Reporting features would include:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Claims statistics and trends</li>
                <li>Verification success rates</li>
                <li>Cost analysis and projections</li>
                <li>Compliance reports</li>
                <li>Export capabilities for accounting</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
