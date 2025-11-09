'use client';

import { useState, useEffect } from 'react';
import { getContract, getCurrentAccount } from '@/lib/web3';

interface AccessControlProps {
  onAccessChanged: () => void;
}

export default function AccessControl({ onAccessChanged }: AccessControlProps) {
  const [providerAddress, setProviderAddress] = useState('');
  const [readAccess, setReadAccess] = useState(true);
  const [writeAccess, setWriteAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessList, setAccessList] = useState<any[]>([]);

  const contract = getContract();

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleGrantAccess = async () => {
    if (!contract || !providerAddress) {
      alert('Please enter provider address');
      return;
    }

    if (!isValidAddress(providerAddress)) {
      alert('Invalid Ethereum address. Address must start with 0x followed by 40 hexadecimal characters.');
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.grantAccess(providerAddress, readAccess, writeAccess);
      await tx.wait();
      alert('Access granted successfully!');
      setProviderAddress('');
      onAccessChanged();
      await loadAccessList();
    } catch (error: any) {
      console.error('Error granting access:', error);
      alert('Error granting access: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (providerAddress: string) => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.revokeAccess(providerAddress);
      await tx.wait();
      alert('Access revoked successfully!');
      onAccessChanged();
      await loadAccessList();
    } catch (error: any) {
      console.error('Error revoking access:', error);
      alert('Error revoking access: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessList = async () => {
    if (!contract) return;

    try {
      const account = await getCurrentAccount();
      if (!account) return;

      const list = await contract.getAccessList(account);
      setAccessList(list);
    } catch (error: any) {
      console.error('Error loading access list:', error);
    }
  };

  useEffect(() => {
    loadAccessList();
  }, [contract]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Grant Access to Provider</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Provider Wallet Address</label>
            <input
              type="text"
              value={providerAddress}
              onChange={(e) => setProviderAddress(e.target.value)}
              placeholder="0x..."
              className={`w-full p-3 bg-gray-800 border rounded-xl text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 ${
                providerAddress && !isValidAddress(providerAddress)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-purple-500'
              }`}
            />
            {providerAddress && !isValidAddress(providerAddress) && (
              <p className="text-xs text-red-400 mt-2">⚠️ Invalid address format. Must be 0x followed by 40 hex characters.</p>
            )}
            {providerAddress && isValidAddress(providerAddress) && (
              <p className="text-xs text-green-400 mt-2">✓ Valid Ethereum address</p>
            )}
            {!providerAddress && (
              <p className="text-xs text-gray-500 mt-2">Enter the wallet address of the hospital or insurance provider</p>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={readAccess}
                onChange={(e) => setReadAccess(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              />
              <span className="text-white">Read Access</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={writeAccess}
                onChange={(e) => setWriteAccess(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              />
              <span className="text-white">Write Access</span>
            </label>
          </div>
          
          <button
            onClick={handleGrantAccess}
            disabled={loading || !providerAddress}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50 transition-all"
          >
            {loading ? 'Granting...' : 'Grant Access'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Granted Access</h3>
        {accessList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No access granted yet.</p>
            <p className="text-sm text-gray-500 mt-2">Grant access to hospitals or insurance providers above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accessList.map((access, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center card-hover">
                <div>
                  <p className="font-mono text-sm text-white">{access.provider}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${access.hasReadAccess ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                      Read: {access.hasReadAccess ? 'Yes' : 'No'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${access.hasWriteAccess ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                      Write: {access.hasWriteAccess ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeAccess(access.provider)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-all"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

