// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CredentialRegistry
 * @notice Decentralized registry for verifiable credentials with trusted issuer management
 * @dev Stores merkle roots of credential batches and manages trusted issuers
 */
contract CredentialRegistry {
    // ===========================================
    // STATE VARIABLES
    // ===========================================

    address public owner;
    
    // ===========================================
    // STRUCTS
    // ===========================================

    struct Issuer {
        string did;
        string name;
        bool active;
        uint256 registeredAt;
    }

    struct Batch {
        bytes32 merkleRoot;
        address issuer;
        string issuerDID;
        uint256 credentialCount;
        uint256 timestamp;
        bool exists;
    }

    struct RevocationEntry {
        bool revoked;
        uint256 revokedAt;
        string reason;
    }

    // ===========================================
    // MAPPINGS
    // ===========================================

    // Trusted Issuers Registry
    mapping(address => Issuer) public trustedIssuers;
    address[] public issuerList;

    // Credential Batches
    mapping(bytes32 => Batch) public batches;
    bytes32[] public batchList;

    // Revocations: merkleRoot => leafIndex => RevocationEntry
    mapping(bytes32 => mapping(uint256 => RevocationEntry)) public revocations;

    // ===========================================
    // EVENTS
    // ===========================================

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event IssuerRegistered(address indexed issuerAddress, string did, string name);
    event IssuerUpdated(address indexed issuerAddress, string did, string name);
    event IssuerRevoked(address indexed issuerAddress);
    event IssuerReactivated(address indexed issuerAddress);
    event BatchAnchored(
        bytes32 indexed merkleRoot, 
        address indexed issuer, 
        string issuerDID,
        uint256 credentialCount,
        uint256 timestamp
    );
    event CredentialRevoked(
        bytes32 indexed merkleRoot,
        uint256 indexed leafIndex,
        string reason,
        uint256 timestamp
    );
    event CredentialUnrevoked(
        bytes32 indexed merkleRoot,
        uint256 indexed leafIndex,
        uint256 timestamp
    );

    // ===========================================
    // MODIFIERS
    // ===========================================

    modifier onlyOwner() {
        require(msg.sender == owner, "CredentialRegistry: caller is not owner");
        _;
    }

    modifier onlyTrustedIssuer() {
        require(trustedIssuers[msg.sender].active, "CredentialRegistry: caller is not trusted issuer");
        _;
    }

    modifier batchExists(bytes32 _merkleRoot) {
        require(batches[_merkleRoot].exists, "CredentialRegistry: batch does not exist");
        _;
    }

    modifier onlyBatchIssuer(bytes32 _merkleRoot) {
        require(batches[_merkleRoot].issuer == msg.sender, "CredentialRegistry: caller is not batch issuer");
        _;
    }

    // ===========================================
    // CONSTRUCTOR
    // ===========================================

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ===========================================
    // OWNER FUNCTIONS
    // ===========================================

    /**
     * @notice Transfer ownership of the contract
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "CredentialRegistry: new owner is zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    /**
     * @notice Register a new trusted issuer
     * @param _issuerAddress Wallet address of the issuer
     * @param _did Decentralized Identifier of the issuer
     * @param _name Human-readable name of the issuer
     */
    function registerIssuer(
        address _issuerAddress,
        string calldata _did,
        string calldata _name
    ) external onlyOwner {
        require(_issuerAddress != address(0), "CredentialRegistry: issuer is zero address");
        require(bytes(_did).length > 0, "CredentialRegistry: DID cannot be empty");
        require(bytes(_name).length > 0, "CredentialRegistry: name cannot be empty");
        require(!trustedIssuers[_issuerAddress].active, "CredentialRegistry: issuer already registered");

        trustedIssuers[_issuerAddress] = Issuer({
            did: _did,
            name: _name,
            active: true,
            registeredAt: block.timestamp
        });

        issuerList.push(_issuerAddress);

        emit IssuerRegistered(_issuerAddress, _did, _name);
    }

    /**
     * @notice Update an existing issuer's information
     * @param _issuerAddress Wallet address of the issuer
     * @param _did New DID (or same)
     * @param _name New name (or same)
     */
    function updateIssuer(
        address _issuerAddress,
        string calldata _did,
        string calldata _name
    ) external onlyOwner {
        require(trustedIssuers[_issuerAddress].registeredAt > 0, "CredentialRegistry: issuer not found");
        require(bytes(_did).length > 0, "CredentialRegistry: DID cannot be empty");
        require(bytes(_name).length > 0, "CredentialRegistry: name cannot be empty");

        trustedIssuers[_issuerAddress].did = _did;
        trustedIssuers[_issuerAddress].name = _name;

        emit IssuerUpdated(_issuerAddress, _did, _name);
    }

    /**
     * @notice Revoke a trusted issuer's status
     * @param _issuerAddress Wallet address of the issuer to revoke
     */
    function revokeIssuer(address _issuerAddress) external onlyOwner {
        require(trustedIssuers[_issuerAddress].active, "CredentialRegistry: issuer not active");
        
        trustedIssuers[_issuerAddress].active = false;
        
        emit IssuerRevoked(_issuerAddress);
    }

    /**
     * @notice Reactivate a previously revoked issuer
     * @param _issuerAddress Wallet address of the issuer to reactivate
     */
    function reactivateIssuer(address _issuerAddress) external onlyOwner {
        require(trustedIssuers[_issuerAddress].registeredAt > 0, "CredentialRegistry: issuer not found");
        require(!trustedIssuers[_issuerAddress].active, "CredentialRegistry: issuer already active");

        trustedIssuers[_issuerAddress].active = true;

        emit IssuerReactivated(_issuerAddress);
    }

    // ===========================================
    // ISSUER FUNCTIONS
    // ===========================================

    /**
     * @notice Anchor a batch of credentials by storing merkle root
     * @param _merkleRoot Merkle root of the credential batch
     * @param _credentialCount Number of credentials in the batch
     */
    function anchorBatch(
        bytes32 _merkleRoot,
        uint256 _credentialCount
    ) external onlyTrustedIssuer {
        require(_merkleRoot != bytes32(0), "CredentialRegistry: invalid merkle root");
        require(_credentialCount > 0, "CredentialRegistry: credential count must be > 0");
        require(!batches[_merkleRoot].exists, "CredentialRegistry: batch already exists");

        Issuer memory issuer = trustedIssuers[msg.sender];

        batches[_merkleRoot] = Batch({
            merkleRoot: _merkleRoot,
            issuer: msg.sender,
            issuerDID: issuer.did,
            credentialCount: _credentialCount,
            timestamp: block.timestamp,
            exists: true
        });

        batchList.push(_merkleRoot);

        emit BatchAnchored(
            _merkleRoot,
            msg.sender,
            issuer.did,
            _credentialCount,
            block.timestamp
        );
    }

    /**
     * @notice Revoke a specific credential in a batch
     * @param _merkleRoot Merkle root of the batch containing the credential
     * @param _leafIndex Index of the credential in the merkle tree
     * @param _reason Reason for revocation
     */
    function revokeCredential(
        bytes32 _merkleRoot,
        uint256 _leafIndex,
        string calldata _reason
    ) external batchExists(_merkleRoot) onlyBatchIssuer(_merkleRoot) {
        require(_leafIndex < batches[_merkleRoot].credentialCount, "CredentialRegistry: leaf index out of bounds");
        require(!revocations[_merkleRoot][_leafIndex].revoked, "CredentialRegistry: already revoked");
        require(bytes(_reason).length > 0, "CredentialRegistry: reason cannot be empty");

        revocations[_merkleRoot][_leafIndex] = RevocationEntry({
            revoked: true,
            revokedAt: block.timestamp,
            reason: _reason
        });

        emit CredentialRevoked(_merkleRoot, _leafIndex, _reason, block.timestamp);
    }

    /**
     * @notice Unrevoke a previously revoked credential
     * @param _merkleRoot Merkle root of the batch containing the credential
     * @param _leafIndex Index of the credential in the merkle tree
     */
    function unrevokeCredential(
        bytes32 _merkleRoot,
        uint256 _leafIndex
    ) external batchExists(_merkleRoot) onlyBatchIssuer(_merkleRoot) {
        require(revocations[_merkleRoot][_leafIndex].revoked, "CredentialRegistry: not revoked");

        revocations[_merkleRoot][_leafIndex].revoked = false;

        emit CredentialUnrevoked(_merkleRoot, _leafIndex, block.timestamp);
    }

    // ===========================================
    // VIEW FUNCTIONS
    // ===========================================

    /**
     * @notice Check if an address is a trusted issuer
     * @param _issuerAddress Address to check
     * @return bool True if trusted and active
     */
    function isIssuerTrusted(address _issuerAddress) external view returns (bool) {
        return trustedIssuers[_issuerAddress].active;
    }

    /**
     * @notice Get issuer details
     * @param _issuerAddress Address of the issuer
     * @return Issuer struct with all details
     */
    function getIssuer(address _issuerAddress) external view returns (Issuer memory) {
        return trustedIssuers[_issuerAddress];
    }

    /**
     * @notice Get all registered issuer addresses
     * @return Array of issuer addresses
     */
    function getAllIssuers() external view returns (address[] memory) {
        return issuerList;
    }

    /**
     * @notice Get the count of registered issuers
     * @return Number of registered issuers
     */
    function getIssuerCount() external view returns (uint256) {
        return issuerList.length;
    }

    /**
     * @notice Get batch details by merkle root
     * @param _merkleRoot Merkle root of the batch
     * @return Batch struct with all details
     */
    function getBatch(bytes32 _merkleRoot) external view returns (Batch memory) {
        return batches[_merkleRoot];
    }

    /**
     * @notice Check if a batch exists
     * @param _merkleRoot Merkle root to check
     * @return bool True if batch exists
     */
    function batchExistsCheck(bytes32 _merkleRoot) external view returns (bool) {
        return batches[_merkleRoot].exists;
    }

    /**
     * @notice Get all batch merkle roots
     * @return Array of merkle roots
     */
    function getAllBatches() external view returns (bytes32[] memory) {
        return batchList;
    }

    /**
     * @notice Get the count of anchored batches
     * @return Number of batches
     */
    function getBatchCount() external view returns (uint256) {
        return batchList.length;
    }

    /**
     * @notice Check if a credential is revoked
     * @param _merkleRoot Merkle root of the batch
     * @param _leafIndex Index of the credential
     * @return bool True if revoked
     */
    function isCredentialRevoked(
        bytes32 _merkleRoot,
        uint256 _leafIndex
    ) external view returns (bool) {
        return revocations[_merkleRoot][_leafIndex].revoked;
    }

    /**
     * @notice Get revocation details for a credential
     * @param _merkleRoot Merkle root of the batch
     * @param _leafIndex Index of the credential
     * @return RevocationEntry struct with all details
     */
    function getRevocationDetails(
        bytes32 _merkleRoot,
        uint256 _leafIndex
    ) external view returns (RevocationEntry memory) {
        return revocations[_merkleRoot][_leafIndex];
    }

    /**
     * @notice Verify a credential's status (exists, not revoked, issuer trusted)
     * @param _merkleRoot Merkle root of the batch
     * @param _leafIndex Index of the credential
     * @return exists Whether the batch exists
     * @return revoked Whether the credential is revoked
     * @return issuerTrusted Whether the issuer is still trusted
     * @return issuerDID The DID of the issuer
     */
    function verifyCredentialStatus(
        bytes32 _merkleRoot,
        uint256 _leafIndex
    ) external view returns (
        bool exists,
        bool revoked,
        bool issuerTrusted,
        string memory issuerDID
    ) {
        Batch memory batch = batches[_merkleRoot];
        
        exists = batch.exists;
        revoked = revocations[_merkleRoot][_leafIndex].revoked;
        issuerTrusted = trustedIssuers[batch.issuer].active;
        issuerDID = batch.issuerDID;
    }
}
