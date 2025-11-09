export const exportRecordsToPDF = (records: any[], patientAddress: string) => {
  // Create a simple HTML document for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medical Records Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #4F46E5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4F46E5;
          margin: 0;
        }
        .patient-info {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .record {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .record-type {
          background: #4F46E5;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        .record-content {
          line-height: 1.6;
        }
        .record-content p {
          margin: 8px 0;
        }
        .label {
          font-weight: bold;
          color: #6b7280;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⚡ Hyperion Medical Records</h1>
        <p>Decentralized Patient Record System</p>
      </div>
      
      <div class="patient-info">
        <p><span class="label">Patient Address:</span> ${patientAddress}</p>
        <p><span class="label">Export Date:</span> ${new Date().toLocaleString()}</p>
        <p><span class="label">Total Records:</span> ${records.length}</p>
      </div>

      ${records.map((record, index) => `
        <div class="record">
          <div class="record-header">
            <div>
              <h3 style="margin: 0; color: #1f2937;">${record.diagnosis}</h3>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                ${new Date(record.timestamp * 1000).toLocaleDateString()}
              </p>
            </div>
            <span class="record-type">${record.recordType}</span>
          </div>
          <div class="record-content">
            <p><span class="label">Hospital:</span> ${record.hospital}</p>
            <p><span class="label">Treatment:</span> ${record.treatment}</p>
            <p><span class="label">IPFS Hash:</span> <code style="font-size: 11px;">${record.ipfsHash}</code></p>
            <p><span class="label">Record ID:</span> ${record.id}</p>
          </div>
        </div>
      `).join('')}

      <div class="footer">
        <p>This document was generated from the Hyperion blockchain-based patient record system.</p>
        <p>All records are secured on the blockchain and stored on IPFS.</p>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="
          background: #4F46E5;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
        ">
          🖨️ Print / Save as PDF
        </button>
        <button onclick="window.close()" style="
          background: #6b7280;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        ">
          ✕ Close
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const exportSingleRecord = (record: any, patientAddress: string) => {
  exportRecordsToPDF([record], patientAddress);
};
