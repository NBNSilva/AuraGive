// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IDonationEscrow
 * @dev Interface for the Smart AI-Based Donation Transparency Escrow Contract.
 * Manages campaigns, milestone-based fund releases, and role-based access.
 */
interface IDonationEscrow {
    
    // Core Structs
    struct Milestone {
        string description;
        uint256 amount;
        bool isApproved;
        bool isReleased;
        string proofDocumentCid; // IPFS CID for receipt/invoice
    }

    struct Campaign {
        address ngoWallet;
        string title;
        string descriptionCid; // IPFS CID for campaign details
        uint256 goalAmount;
        uint256 raisedAmount;
        bool isVerified;       // True if passed AI Audit
        bool isActive;
        uint256 milestoneCount;
    }

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed ngoWallet);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event MilestoneRequested(uint256 indexed campaignId, uint256 milestoneId, string proofDocumentCid);
    event FundsReleased(uint256 indexed campaignId, uint256 milestoneId, uint256 amount);
    event CampaignVerified(uint256 indexed campaignId);

    /**
     * @notice Allows an NGO to create a new campaign
     * @param title Title of the campaign
     * @param descriptionCid IPFS CID storing the campaign details
     * @param goalAmount Total amount requested for the campaign
     * @return campaignId The ID of the newly created campaign
     */
    function createCampaign(
        string calldata title,
        string calldata descriptionCid,
        uint256 goalAmount
    ) external returns (uint256 campaignId);

    /**
     * @notice Allows users to donate USDC to a specific verified campaign
     * @param campaignId The ID of the campaign to donate to
     * @param amount The amount of USDC to donate
     */
    function donate(uint256 campaignId, uint256 amount) external;

    /**
     * @notice Allows an NGO to request funds for a specific milestone by submitting a proof document
     * @param campaignId The ID of the campaign
     * @param milestoneId The ID of the milestone
     * @param proofDocumentCid IPFS CID storing the receipt/invoice
     */
    function requestMilestoneRelease(
        uint256 campaignId,
        uint256 milestoneId,
        string calldata proofDocumentCid
    ) external;

    /**
     * @notice Allows an Admin (or AI oracle) to approve a milestone request
     * @param campaignId The ID of the campaign
     * @param milestoneId The ID of the milestone
     */
    function approveMilestone(uint256 campaignId, uint256 milestoneId) external;

    /**
     * @notice Allows an NGO to release the funds of an approved milestone to their wallet
     * @param campaignId The ID of the campaign
     * @param milestoneId The ID of the milestone
     */
    function releaseFunds(uint256 campaignId, uint256 milestoneId) external;
}
