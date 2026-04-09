// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CredentialRegistry
 * @notice Minimal merkle root anchoring for verifiable credentials
 * @dev Stores only merkle roots - issuer management & revocation handled off-chain in MongoDB
 */
contract CredentialRegistry {
    
    // Batch: merkleRoot => (issuer address, timestamp, exists)
    mapping(bytes32 => uint256) public batches; // Packed: issuer (160 bits) + timestamp (64 bits) + exists (1 bit)
    
    event BatchAnchored(bytes32 indexed merkleRoot, address indexed issuer, uint256 timestamp);

    /**
     * @notice Anchor a credential batch merkle root
     * @param _merkleRoot Merkle root of the credential batch
     */
    function anchorBatch(bytes32 _merkleRoot) external {
        require(_merkleRoot != bytes32(0), "Invalid root");
        require(batches[_merkleRoot] == 0, "Exists");

        // Pack: issuer (160 bits) | timestamp (64 bits) | exists flag (set by non-zero)
        batches[_merkleRoot] = (uint256(uint160(msg.sender)) << 96) | (block.timestamp << 32) | 1;

        emit BatchAnchored(_merkleRoot, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify a merkle root exists on-chain
     * @param _merkleRoot Merkle root to verify
     * @return found Whether the batch exists
     * @return issuer Address that anchored it
     * @return timestamp When it was anchored
     */
    function verify(bytes32 _merkleRoot) external view returns (bool found, address issuer, uint256 timestamp) {
        uint256 packed = batches[_merkleRoot];
        found = packed != 0;
        if (found) {
            issuer = address(uint160(packed >> 96));
            timestamp = (packed >> 32) & 0xFFFFFFFFFFFFFFFF;
        }
    }

    /**
     * @notice Check if a batch exists (gas-efficient)
     * @param _merkleRoot Merkle root to check
     * @return bool True if exists
     */
    function exists(bytes32 _merkleRoot) external view returns (bool) {
        return batches[_merkleRoot] != 0;
    }
}
