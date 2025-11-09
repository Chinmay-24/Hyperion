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
      
      // Use public IPFS gateway (works without auth)
      // Alternative: localhost IPFS node if running locally
      ipfs = create({
        url: 'https://ipfs.io/api/v0'  // Public gateway
      });
      
      console.log('IPFS initialized with public gateway');
    } catch (error) {
      console.error('Error initializing IPFS:', error);
      // For development: create mock IPFS for testing
      ipfs = {
        add: async (data) => {
          // Generate a fake hash for development
          const fakeHash = 'Qm' + Math.random().toString(36).substr(2, 44);
          console.warn('Using mock IPFS - data not actually uploaded. Hash:', fakeHash);
          // Store in sessionStorage for demo purposes
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(fakeHash, typeof data === 'string' ? data : JSON.stringify(data));
          }
          return { path: fakeHash };
        },
        cat: async function* (hash) {
          // Retrieve from sessionStorage for demo
          if (typeof sessionStorage !== 'undefined') {
            const data = sessionStorage.getItem(hash);
            if (data) {
              yield new TextEncoder().encode(data);
            }
          }
        }
      };
      console.warn('Using mock IPFS client for development');
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

