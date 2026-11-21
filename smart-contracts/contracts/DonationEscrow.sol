// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IDonationEscrow.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DonationEscrow is IDonationEscrow, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");

    IERC20 public usdcToken;
    uint256 public nextCampaignId;
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    
    constructor(address _usdcTokenAddress) {
        require(_usdcTokenAddress != address(0), "Invalid token address");
        usdcToken = IERC20(_usdcTokenAddress);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function createCampaign(
        string calldata title,
        string calldata descriptionCid,
        uint256 goalAmount
    ) external override returns (uint256 campaignId) {
        require(goalAmount > 0, "Goal amount must be > 0");
        
        campaignId = nextCampaignId++;
        
        Campaign storage c = campaigns[campaignId];
        c.ngoWallet = msg.sender;
        c.title = title;
        c.descriptionCid = descriptionCid;
        c.goalAmount = goalAmount;
        c.isActive = true;
        c.isVerified = true; 
        
        emit CampaignCreated(campaignId, msg.sender);
        return campaignId;
    }

    function setCampaignVerification(uint256 campaignId, bool verified) external onlyRole(AI_ORACLE_ROLE) {
        require(campaigns[campaignId].isActive, "Campaign does not exist");
        campaigns[campaignId].isVerified = verified;
        if (verified) {
            emit CampaignVerified(campaignId);
        }
    }

    function donate(uint256 campaignId, uint256 amount) external {
        require(campaigns[campaignId].isActive, "Campaign is not active");
        require(campaigns[campaignId].isVerified, "Campaign is not verified");
        require(amount > 0, "Donation must be > 0");

        // Transfer USDC from donor to this contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        campaigns[campaignId].raisedAmount += amount;
        
        emit DonationReceived(campaignId, msg.sender, amount);
    }

    // Deprecated payable donate removed to match IDonationEscrow

    function addMilestone(
        uint256 campaignId, 
        string calldata description, 
        uint256 amount
    ) external {
        require(msg.sender == campaigns[campaignId].ngoWallet, "Only NGO can add milestone");
        
        uint256 milestoneId = campaigns[campaignId].milestoneCount++;
        Milestone storage m = milestones[campaignId][milestoneId];
        m.description = description;
        m.amount = amount;
    }

    function requestMilestoneRelease(
        uint256 campaignId,
        uint256 milestoneId,
        string calldata proofDocumentCid
    ) external override {
        require(msg.sender == campaigns[campaignId].ngoWallet, "Only NGO can request release");
        require(milestoneId < campaigns[campaignId].milestoneCount, "Invalid milestone");
        
        Milestone storage m = milestones[campaignId][milestoneId];
        require(!m.isApproved, "Already approved");
        require(!m.isReleased, "Already released");
        
        m.proofDocumentCid = proofDocumentCid;
        
        emit MilestoneRequested(campaignId, milestoneId, proofDocumentCid);
    }

    function approveMilestone(uint256 campaignId, uint256 milestoneId) external override onlyRole(ADMIN_ROLE) {
        require(milestoneId < campaigns[campaignId].milestoneCount, "Invalid milestone");
        
        Milestone storage m = milestones[campaignId][milestoneId];
        require(!m.isApproved, "Already approved");
        
        m.isApproved = true;
    }

    function releaseFunds(uint256 campaignId, uint256 milestoneId) external override {
        require(msg.sender == campaigns[campaignId].ngoWallet, "Only NGO can release funds");
        
        Milestone storage m = milestones[campaignId][milestoneId];
        require(m.isApproved, "Milestone not approved");
        require(!m.isReleased, "Funds already released");
        
        m.isReleased = true;
        
        // Transfer USDC to NGO
        usdcToken.safeTransfer(msg.sender, m.amount);
        
        emit FundsReleased(campaignId, milestoneId, m.amount);
    }
}
