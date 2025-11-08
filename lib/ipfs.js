// IPFS client - only loads on client side
let ipfs = null;
let ipfsModule = null;

async function getIPFS() {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!ipfs) {
    try {
      // Dynamic import to avoid SSR issues
      if (!ipfsModule) {
        ipfsModule = await import('ipfs-http-client');
      }
      const { create } = ipfsModule;
      
      ipfs = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: process.env.NEXT_PUBLIC_IPFS_AUTH || ''
        }
      });
    } catch (error) {
      console.error('Error initializing IPFS:', error);
      // Fallback to public gateway
      try {
        if (!ipfsModule) {
          ipfsModule = await import('ipfs-http-client');
        }
        const { create } = ipfsModule;
        ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
      } catch (fallbackError) {
        console.error('Error with IPFS fallback:', fallbackError);
      }
    }
  }
  return ipfs;
}

// Alternative: Use public IPFS gateway
// const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

/**
 * Upload encrypted data to IPFS
 * @param {string|Buffer} encryptedData - Encrypted data to upload
 * @returns {Promise<string>} IPFS hash
 */
export async function uploadToIPFS(encryptedData) {
  try {
    const ipfsClient = await getIPFS();
    if (!ipfsClient) {
      throw new Error('IPFS not initialized. This function only works in the browser.');
    }
    const result = await ipfsClient.add(encryptedData);
    return result.path; // IPFS hash (CID)
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Retrieve data from IPFS
 * @param {string} ipfsHash - IPFS hash (CID)
 * @returns {Promise<Buffer>} File content
 */
export async function getFromIPFS(ipfsHash) {
  try {
    const ipfsClient = await getIPFS();
    if (!ipfsClient) {
      throw new Error('IPFS not initialized. This function only works in the browser.');
    }
    const chunks = [];
    for await (const chunk of ipfsClient.cat(ipfsHash)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
}

/**
 * Upload file to IPFS
 * @param {File} file - File to upload
 * @returns {Promise<string>} IPFS hash
 */
export async function uploadFileToIPFS(file) {
  try {
    const ipfsClient = await getIPFS();
    if (!ipfsClient) {
      throw new Error('IPFS not initialized. This function only works in the browser.');
    }
    const fileBuffer = await file.arrayBuffer();
    const result = await ipfsClient.add(new Uint8Array(fileBuffer));
    return result.path;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
}

export default getIPFS;

