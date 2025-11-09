'use client';

import { useState } from 'react';

interface TimelineRecord {
  id: string;
  date: string;
  type: string;
  hospital: string;
  diagnosis: string;
  treatment: string;
}

export default function MedicalTimeline({ records }: { records: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'checkup': 'bg-green-500',
      'emergency': 'bg-red-500',
      'surgery': 'bg-purple-500',
      'consultation': 'bg-blue-500',
      'lab': 'bg-yellow-500',
      'default': 'bg-gray-500'
    };
    return colors[type.toLowerCase()] || colors.default;
  };

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="space-y-6">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No medical records yet</p>
          </div>
        ) : (
          records.map((record, index) => (
            <div key={index} className="relative pl-20">
              <div className={`absolute left-5 w-6 h-6 rounded-full ${getRecordTypeColor(record.recordType)} ring-4 ring-slate-900 flex items-center justify-center`}>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              
              <div 
                className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{record.diagnosis}</h3>
                    <p className="text-sm text-gray-400">{formatDate(record.timestamp)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getRecordTypeColor(record.recordType)}`}>
                    {record.recordType}
                  </span>
                </div>
                
                <div className="text-gray-300 mb-2">
                  <span className="text-sm">🏥 {record.hospital}</span>
                </div>

                {expandedId === record.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 animate-fade-in">
                    <div>
                      <span className="text-gray-400 text-sm">Treatment:</span>
                      <p className="text-white mt-1">{record.treatment}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">IPFS Hash:</span>
                      <p className="text-xs text-blue-400 mt-1 font-mono break-all">{record.ipfsHash}</p>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="btn-primary text-sm py-2 px-4">
                        📄 View Details
                      </button>
                      <button className="glass-card text-sm py-2 px-4 hover:bg-white/10 transition-all">
                        📥 Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
