'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getContract } from '@/lib/web3';
import { uploadToIPFS } from '@/lib/ipfs';
import { encryptData, generateKeyFromAddress } from '@/lib/encryption';

export default function HospitalPortal() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [patientAddress, setPatientAddress] = useState('');
  const [newRecord, setNewRecord] = useState({
    data: '',
    recordType: 'diagnosis'
  });
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'requests' | 'patients'>('create');

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

  const handleCreateRecord = async () => {
    if (!contract || !account || !patientAddress || !newRecord.data) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Generate encryption key from patient's address
      const encryptionKey = generateKeyFromAddress(patientAddress);
      const encryptedData = encryptData(newRecord.data, encryptionKey);
      const ipfsHash = await uploadToIPFS(encryptedData);
      
      const tx = await contract.createRecord(
        ipfsHash,
        patientAddress,
        newRecord.recordType
      );
      
      await tx.wait();
      
      alert('Record created successfully!');
      setNewRecord({ data: '', recordType: 'diagnosis' });
      setPatientAddress('');
    } catch (error: any) {
      console.error('Error creating record:', error);
      alert('Error creating record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!account) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-effect rounded-2xl p-12">
            <div className="text-6xl mb-6">🏥</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Hospital Portal</h2>
            <p className="text-gray-300 mb-8">
              Connect your hospital wallet to access patient records
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Hospital Wallet'}
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
            Hospital Portal
          </h1>
          <p className="text-gray-400">Healthcare provider dashboard for patient record management</p>
        </div>

        {/* Tabs */}
        <div className="glass-effect rounded-xl p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            ➕ Create Record
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📋 Access Requests
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'patients'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            👥 Patients
          </button>
        </div>

        {/* Create Record Tab */}
        {activeTab === 'create' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create Patient Record</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Patient Wallet Address
                </label>
                <input
                  type="text"
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the patient's wallet address to create a record for them
                </p>
              </div>
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
                  placeholder="Enter medical record details, diagnosis, treatment notes, etc..."
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={8}
                />
              </div>
              <button
                onClick={handleCreateRecord}
                disabled={loading || !newRecord.data || !patientAddress}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Creating Record...' : '✨ Create Patient Record'}
              </button>
            </div>
          </div>
        )}

        {/* Access Requests Tab */}
        {activeTab === 'requests' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Access Requests</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <p className="text-gray-400 mb-4">
                Patients can grant you access to their records. Once access is granted, you'll be able to view and update their records.
              </p>
              <p className="text-sm text-gray-500">
                Access requests from patients will appear here. Patients grant access through their portal.
              </p>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="glass-effect rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Patient List</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <p className="text-gray-400">
                List of patients you have access to would appear here. This would show:
              </p>
              <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
                <li>Patients who have granted you access</li>
                <li>Recent records created for each patient</li>
                <li>Quick access to view patient history</li>
                <li>Ability to create new records for patients</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
