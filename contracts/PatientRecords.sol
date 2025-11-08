// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PatientRecords
 * @dev Decentralized patient record management system
 * Stores encrypted IPFS hashes and access control on blockchain
 */
contract PatientRecords {
    // Patient record structure
    struct Record {
        string ipfsHash;           // IPFS hash of encrypted record
        address patient;           // Patient's wallet address
        address provider;          // Healthcare provider's address
        uint256 timestamp;         // When record was created
        string recordType;         // Type of record (diagnosis, prescription, etc.)
        bool isActive;             // Whether record is active
    }

    // Access control structure
    struct Access {
        address provider;          // Provider with access
        bool hasReadAccess;        // Read permission
        bool hasWriteAccess;       // Write permission
        uint256 grantedAt;         // When access was granted
    }

    // Mapping: patient address => record IDs
    mapping(address => uint256[]) public patientRecords;
    
    // Mapping: record ID => Record
    mapping(uint256 => Record) public records;
    
    // Mapping: patient => providers with access
    mapping(address => Access[]) public accessList;
    
    // Mapping: patient => provider => has access
    mapping(address => mapping(address => bool)) public hasAccess;
    
    // Total records counter
    uint256 public totalRecords;
    
    // Events
    event RecordCreated(
        uint256 indexed recordId,
        address indexed patient,
        address indexed provider,
        string ipfsHash,
        string recordType
    );
    
    event AccessGranted(
        address indexed patient,
        address indexed provider,
        bool readAccess,
        bool writeAccess
    );
    
    event AccessRevoked(
        address indexed patient,
        address indexed provider
    );
    
    event RecordUpdated(
        uint256 indexed recordId,
        string newIpfsHash
    );

    /**
     * @dev Create a new patient record
     * @param _ipfsHash IPFS hash of the encrypted record
     * @param _patient Patient's wallet address
     * @param _recordType Type of medical record
     */
    function createRecord(
        string memory _ipfsHash,
        address _patient,
        string memory _recordType
    ) public returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_patient != address(0), "Invalid patient address");
        
        totalRecords++;
        uint256 recordId = totalRecords;
        
        records[recordId] = Record({
            ipfsHash: _ipfsHash,
            patient: _patient,
            provider: msg.sender,
            timestamp: block.timestamp,
            recordType: _recordType,
            isActive: true
        });
        
        patientRecords[_patient].push(recordId);
        
        emit RecordCreated(recordId, _patient, msg.sender, _ipfsHash, _recordType);
        
        return recordId;
    }

    /**
     * @dev Update an existing record (only by original provider or with write access)
     */
    function updateRecord(
        uint256 _recordId,
        string memory _newIpfsHash
    ) public {
        require(records[_recordId].isActive, "Record does not exist or is inactive");
        require(
            records[_recordId].provider == msg.sender ||
            (hasAccess[records[_recordId].patient][msg.sender] && 
             _hasWriteAccess(records[_recordId].patient, msg.sender)),
            "Unauthorized: No write access"
        );
        require(bytes(_newIpfsHash).length > 0, "IPFS hash cannot be empty");
        
        records[_recordId].ipfsHash = _newIpfsHash;
        
        emit RecordUpdated(_recordId, _newIpfsHash);
    }

    /**
     * @dev Grant access to a healthcare provider
     */
    function grantAccess(
        address _provider,
        bool _readAccess,
        bool _writeAccess
    ) public {
        require(_provider != address(0), "Invalid provider address");
        require(_provider != msg.sender, "Cannot grant access to yourself");
        require(!hasAccess[msg.sender][_provider], "Access already granted");
        
        accessList[msg.sender].push(Access({
            provider: _provider,
            hasReadAccess: _readAccess,
            hasWriteAccess: _writeAccess,
            grantedAt: block.timestamp
        }));
        
        hasAccess[msg.sender][_provider] = true;
        
        emit AccessGranted(msg.sender, _provider, _readAccess, _writeAccess);
    }

    /**
     * @dev Revoke access from a healthcare provider
     */
    function revokeAccess(address _provider) public {
        require(hasAccess[msg.sender][_provider], "Access not granted");
        
        hasAccess[msg.sender][_provider] = false;
        
        // Remove from access list
        Access[] storage accesses = accessList[msg.sender];
        for (uint256 i = 0; i < accesses.length; i++) {
            if (accesses[i].provider == _provider) {
                accesses[i] = accesses[accesses.length - 1];
                accesses.pop();
                break;
            }
        }
        
        emit AccessRevoked(msg.sender, _provider);
    }

    /**
     * @dev Get all record IDs for a patient
     */
    function getPatientRecords(address _patient) public view returns (uint256[] memory) {
        require(
            _patient == msg.sender ||
            records[0].patient == _patient ||
            hasAccess[_patient][msg.sender],
            "Unauthorized: No access to patient records"
        );
        return patientRecords[_patient];
    }

    /**
     * @dev Get record details
     */
    function getRecord(uint256 _recordId) public view returns (Record memory) {
        Record memory record = records[_recordId];
        require(record.isActive, "Record does not exist");
        require(
            record.patient == msg.sender ||
            record.provider == msg.sender ||
            (hasAccess[record.patient][msg.sender] && 
             _hasReadAccess(record.patient, msg.sender)),
            "Unauthorized: No access to this record"
        );
        return record;
    }

    /**
     * @dev Get access list for a patient
     */
    function getAccessList(address _patient) public view returns (Access[] memory) {
        require(_patient == msg.sender, "Can only view your own access list");
        return accessList[_patient];
    }

    /**
     * @dev Check if provider has read access
     */
    function _hasReadAccess(address _patient, address _provider) private view returns (bool) {
        Access[] memory accesses = accessList[_patient];
        for (uint256 i = 0; i < accesses.length; i++) {
            if (accesses[i].provider == _provider && accesses[i].hasReadAccess) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Check if provider has write access
     */
    function _hasWriteAccess(address _patient, address _provider) private view returns (bool) {
        Access[] memory accesses = accessList[_patient];
        for (uint256 i = 0; i < accesses.length; i++) {
            if (accesses[i].provider == _provider && accesses[i].hasWriteAccess) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Deactivate a record (soft delete)
     */
    function deactivateRecord(uint256 _recordId) public {
        require(records[_recordId].isActive, "Record already inactive");
        require(
            records[_recordId].patient == msg.sender ||
            records[_recordId].provider == msg.sender,
            "Unauthorized: Cannot deactivate this record"
        );
        records[_recordId].isActive = false;
    }
}

