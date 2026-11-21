# -*- coding: utf-8 -*-
"""
Section 3 to 5 Builder:
- 4.3 Smart Contract Escrow Architecture
- 4.4 Artificial Intelligence & Machine Learning Trust Subsystem
- 4.5 Backend Middleware and RESTful API Orchestration Layer
- 4.6 Client-Side Application Engineering - Donor Portal
- 4.7 Administrative Dashboard Engineering
"""

from docx_format_utils import (
    add_heading_1, add_heading_2, add_heading_3,
    add_body_paragraph, add_bullet_point, BLACK
)
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def build_subsystems(doc):
    # --- SECTION 4.3 ---
    add_heading_2(doc, "4.3 Smart Contract & Decentralized Escrow Implementation")
    
    add_heading_3(doc, "4.3.1 Interface Specification (IDonationEscrow.sol)")
    add_body_paragraph(
        doc,
        "The smart contract architecture of AuraGive is grounded upon a strictly defined interface contract, IDonationEscrow.sol. "
        "Adhering to modern software engineering principles, the interface decouples the external contract application binary interface "
        "(ABI) from the underlying business logic implementation, allowing for future contract upgrades and seamless interoperability "
        "with external decentralized finance (DeFi) protocols and oracle networks."
    )
    add_body_paragraph(
        doc,
        "The interface specifies two primary data structures (structs) that govern campaign and milestone states on the blockchain:"
    )
    add_bullet_point(doc, "struct Milestone: ", "Encapsulates the discrete funding tranches of a campaign. Contains a string description, uint256 amount (denominated in USDC token base units with 6 decimals), bool isApproved (indicating administrative verification of milestone completion), bool isReleased (indicating physical transfer of funds to the NGO wallet), and string proofDocumentCid (storing the immutable IPFS Content Identifier of the expenditure receipt or physical audit document).")
    add_bullet_point(doc, "struct Campaign: ", "Represents the root entity of a fundraising project. Contains address ngoWallet (the cryptographic address of the executing organization), string title, string descriptionCid (IPFS CID for extensive multimedia and textual campaign descriptions), uint256 goalAmount (total financial target), uint256 raisedAmount (cumulative donor contributions received), bool isVerified (state flag asserting that the campaign has successfully passed the AI audit), bool isActive (operational status flag), and uint256 milestoneCount (counter tracking allocated funding milestones).")
    add_body_paragraph(
        doc,
        "Additionally, IDonationEscrow.sol defines an indexed event logging taxonomy that emits real-time state mutations to the "
        "blockchain transaction log. These events include CampaignCreated(uint256 indexed campaignId, address indexed ngoWallet), "
        "DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount), MilestoneRequested(uint256 indexed campaignId, "
        "uint256 milestoneId, string proofDocumentCid), FundsReleased(uint256 indexed campaignId, uint256 milestoneId, uint256 amount), "
        "and CampaignVerified(uint256 indexed campaignId). These emitted events serve as the real-time event feed for client-side "
        "reactive updates and off-chain data indexing services (such as The Graph or custom Web3 websockets)."
    )

    add_heading_3(doc, "4.3.2 Escrow Implementation Mechanics (DonationEscrow.sol)")
    add_body_paragraph(
        doc,
        "The concrete implementation contract, DonationEscrow.sol, inherits from both IDonationEscrow and OpenZeppelin's AccessControl "
        "module. The contract is instantiated with the contract address of the compliant ERC-20 token (USDC). Upon deployment, the deployer "
        "address is granted both DEFAULT_ADMIN_ROLE and ADMIN_ROLE permissions, establishing the cryptographic root of trust."
    )
    add_body_paragraph(
        doc,
        "The lifecycle of an escrow campaign proceeds through several rigorous on-chain state transitions:"
    )
    add_bullet_point(doc, "Campaign Initialization (createCampaign): ", "Invoked by an NGO address to instantiate a new campaign. The function validates that goalAmount > 0, assigns a monotonic campaignId via nextCampaignId++, populates the Campaign storage struct, and sets isActive and isVerified flags to true. Emits CampaignCreated.")
    add_bullet_point(doc, "Oracle AI Verification (setCampaignVerification): ", "Restricted exclusively to addresses possessing the AI_ORACLE_ROLE. Allows automated AI oracles or backend review services to dynamically set the isVerified status flag on-chain, ensuring that unverified or fraudulent campaigns cannot accept capital.")
    add_bullet_point(doc, "Donation Processing (donate): ", "Accepts campaignId and amount parameters. Executes strict precondition checks: require(campaigns[campaignId].isActive), require(campaigns[campaignId].isVerified), and require(amount > 0). The contract uses OpenZeppelin's SafeERC20 library to execute usdcToken.safeTransferFrom(msg.sender, address(this), amount), transferring tokens directly from the donor's wallet to the escrow contract while incrementing campaigns[campaignId].raisedAmount and emitting DonationReceived.")
    add_bullet_point(doc, "Milestone Creation (addMilestone): ", "Allows the designated ngoWallet to append structured funding tranches to their campaign prior to or during fundraising. Assigns a unique milestoneId, sets description and target amount.")
    add_bullet_point(doc, "Milestone Release Request (requestMilestoneRelease): ", "Restricted to msg.sender == campaigns[campaignId].ngoWallet. The NGO submits the IPFS CID of their expenditure proof document. The function verifies that the milestone is neither already approved nor released, updates proofDocumentCid, and emits MilestoneRequested.")
    add_bullet_point(doc, "Administrative Milestone Approval (approveMilestone): ", "Restricted strictly to callers with ADMIN_ROLE. Validates the existence of the milestone, audits the submitted IPFS proof document off-chain, and mutates m.isApproved = true.")
    add_bullet_point(doc, "Fund Disbursement (releaseFunds): ", "Invoked by the NGO once approval is granted. Enforces require(m.isApproved) and require(!m.isReleased). Sets m.isReleased = true and executes usdcToken.safeTransfer(msg.sender, m.amount), transferring the exact tranche of USDC tokens directly to the NGO wallet. Emits FundsReleased.")

    add_heading_3(doc, "4.3.3 Role-Based Access Control and SafeERC20 Transfers")
    add_body_paragraph(
        doc,
        "Security engineering in Solidity requires defense-in-depth against reentrancy attacks, integer arithmetic manipulation, and "
        "unauthorized privileged function execution. In DonationEscrow.sol, access control is enforced via OpenZeppelin's AccessControl "
        "role-based permissions pattern using Keccak-256 hashed identifiers: bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE') "
        "and bytes32 public constant AI_ORACLE_ROLE = keccak256('AI_ORACLE_ROLE'). By utilizing modifier onlyRole(ADMIN_ROLE), administrative "
        "actions cannot be executed by arbitrary external callers."
    )
    add_body_paragraph(
        doc,
        "Furthermore, the contract utilizes OpenZeppelin's SafeERC20 wrapper for all token interactions (using SafeERC20 for IERC20). "
        "Standard ERC-20 implementations frequently exhibit subtle non-standard return values (e.g., returning void instead of a boolean "
        "success flag, as observed in USDT). SafeERC20 inspects both the transaction return data and low-level call execution status, "
        "reverting immediately if a transfer fails. This guarantees that internal accounting balances in AuraGive are never mutated "
        "unless tokens have been irrevocably credited to or debited from the contract."
    )

    # --- SECTION 4.4 ---
    add_heading_2(doc, "4.4 Artificial Intelligence & Machine Learning Trust Subsystem")
    
    add_heading_3(doc, "4.4.1 Asynchronous FastAPI Service Architecture (backend-ai/app.py)")
    add_body_paragraph(
        doc,
        "The Artificial Intelligence layer of AuraGive is encapsulated in an asynchronous Python microservice built upon the FastAPI "
        "framework. FastAPI was selected for its exceptional throughput, native ASGI asynchronous request handling, and automatic "
        "JSON schema validation via Pydantic models. The microservice operates at Port 5000 and is configured with CORS middleware "
        "to permit authenticated cross-origin requests from both the Node.js backend and React client applications."
    )
    add_body_paragraph(
        doc,
        "The microservice exposes two primary RESTful endpoints:"
    )
    add_bullet_point(doc, "GET /health: ", "A lightweight health-check endpoint returning {'status': 'healthy'} to facilitate automated container liveness and readiness probing.")
    add_bullet_point(doc, "POST /analyse: ", "The core Natural Language Processing endpoint. Ingests a JSON payload validated against the CampaignRequest Pydantic model (containing description: str and district: str). Returns a structured diagnostic JSON object containing trust_score (integer 0–100), status ('High Trust', 'Medium Trust', or 'Low Trust'), and a detailed, explainable breakdown string.")

    add_heading_3(doc, "4.4.2 spaCy Named Entity Recognition and Gazetteer Verification")
    add_body_paragraph(
        doc,
        "Upon receiving a campaign analysis request, the /analyse route executes a deterministic multi-stage verification algorithm:"
    )
    add_bullet_point(doc, "Named Entity Recognition (NER): ", "The raw campaign narrative is passed into the spaCy en_core_web_sm pipeline. spaCy tokenizes the text and performs part-of-speech (POS) tagging and dependency parsing before extracting named entities. The service filters extracted entities for two specific label categories: ORG (representing institutional, school, and organizational names) and GPE/LOC (representing geopolitical entities, towns, and districts).")
    add_bullet_point(doc, "Gazetteer Cross-Referencing: ", "The service iterates through the extracted ORG entities and queries a pre-processed pandas DataFrame populated from schools_dataset.csv. Matching is performed using case-insensitive substring comparisons against normalized school names (School_Name_Lower). If no spaCy ORG entity produces a match, the algorithm executes a fallback heuristic scanning the raw description for any substring matching verified school names in the dataset.")
    add_bullet_point(doc, "Three-Tier Algorithmic Trust Scoring: ", "If no school record is identified, the system assigns a Low Trust Score (25%) with the diagnostic message: 'School Identity: Not found in official provincial registry. Manual verification required.' If a school is matched, the algorithm proceeds to verify geographical consistency: it checks whether the claimed district matches the official dataset district, or whether an extracted GPE/LOC entity matches the record. If location matches, the campaign is awarded High Trust (95%) ('School Identity: Verified. Location: Verified.'). If a location discrepancy is detected, the campaign receives Medium Trust (65%) ('School Identity: Verified. Location: Warning [Claimed district does not match official record]').")

    add_heading_3(doc, "4.4.3 Supervised Random Forest Classifier for Risk Profiling (backend-ai/train_model.py, main.py)")
    add_body_paragraph(
        doc,
        "In addition to the deterministic NER gazetteer pipeline, AuraGive incorporates a supervised machine learning model engineered "
        "to evaluate continuous numerical and categorical risk indicators. Developed using scikit-learn (train_model.py), the model "
        "trains a RandomForestClassifier (n_estimators=100, random_state=42) on a multi-dimensional feature space designed to detect "
        "anomalous crowdfunding proposals:"
    )
    add_bullet_point(doc, "Feature Set: ", "Features include: goal_amount (log-normally distributed funding targets), description_length (text word/character density), has_social_links (binary indicator of NGO external presence), has_website (binary indicator of formal domain registration), and has_previous_campaigns (historical completion record).")
    add_bullet_point(doc, "Ground-Truth Probability Synthesis: ", "A synthetic ground-truth probability distribution is modeled via a sigmoid response curve where external verification signals positively increment legitimacy probability, while disproportionately high funding goals penalize the score.")
    add_bullet_point(doc, "Inference Gateway (main.py): ", "Exposes the POST /predict-trust endpoint. Inputs are transformed via serialized Joblib encoders (category_encoder.pkl, remoteness_encoder.pkl) before passing into the trained Random Forest model to calculate predict_proba confidence metrics, categorizing proposals into 'Approved' (>80%), 'Flagged for Review' (50–80%), or 'Rejected' (<50%).")

    add_heading_3(doc, "4.4.4 Provincial Schools Gazetteer Dataset (schools_dataset.csv)")
    add_body_paragraph(
        doc,
        "The gazetteer dataset acts as the localized ground truth for educational institutions in Sri Lanka. It contains verified metadata "
        "spanning multiple provinces (Central, North Western, Southern, Eastern, North Central, Uva) and districts (Kurunegala, Nuwara Eliya, "
        "Badulla, Batticaloa, Anuradhapura, Kandy, Galle, Colombo). Attributes include School_Name, District, Province, Category (Classrooms, "
        "Sanitation, Energy & IT, Libraries, Furniture), Scale_Index (1–10 indicating student population density), and Remoteness Index "
        "(High, Medium, Low). Pre-processing normalizes all textual attributes to lower case and removes punctuation variations to ensure "
        "robust matching against diverse donor and NGO text inputs."
    )

    # --- SECTION 4.5 ---
    add_heading_2(doc, "4.5 Backend Middleware and RESTful API Orchestration Layer")
    
    add_heading_3(doc, "4.5.1 Mongoose Schemas and Sub-Document Modeling (Campaign.js, User.js)")
    add_body_paragraph(
        doc,
        "The Node.js middleware utilizes Mongoose Object Data Modeling (ODM) to interface with MongoDB. The database schema is structured "
        "to mirror both on-chain smart contract states and rich off-chain multimedia metadata:"
    )
    add_bullet_point(doc, "MilestoneSchema (Sub-Document): ", "Defines nested milestone objects embedded directly within parent campaigns. Schema properties include id (numeric), name (String), amount (Number), proofDocumentCid (String), aiAuditScore (Number, min 0, max 100), aiAuditFeedback (String), status (String, default 'pending'), requestedAt (Date), and processedAt (Date).")
    add_bullet_point(doc, "CampaignSchema (Parent Document): ", "Encapsulates campaign attributes including campaignId (indexed Number), ngoWallet (indexed lowercase String), title (required String), category (String), remoteness (String), location (String), goal (Number), raised (Number), score (Number, default 0), scoreBreakdown (String), status (String, default 'Pending AI Review'), image (String path), description (String), and milestones ([MilestoneSchema]). Utilizes schema virtuals to map MongoDB's _id to id for seamless frontend consumption.")
    add_bullet_point(doc, "UserSchema: ", "Captures user identity and authorization credentials, containing walletAddress (indexed lowercase unique String), role (String: 'DONOR' or 'ADMIN'), name (String), email (String), and registration timestamps.")

    add_heading_3(doc, "4.5.2 Express API Endpoints and Proxy Review Pipeline (server.js)")
    add_body_paragraph(
        doc,
        "The Express application (server.js) initializes the database connection and deterministically seeds five baseline campaigns if the "
        "database collection is empty. It provides a comprehensive RESTful API surface:"
    )
    add_bullet_point(doc, "POST /api/auth/login: ", "Authenticates donor and administrator Web3 wallet connections. If the wallet address does not exist, a new user record is instantiated in MongoDB; otherwise, existing profile metadata is returned.")
    add_bullet_point(doc, "GET /api/campaigns: ", "Retrieves campaigns with optional query parameters for category filtering (?category=Sanitation) and case-insensitive regex search (?search=Water).")
    add_bullet_point(doc, "POST /api/campaigns: ", "Creates a new campaign document in MongoDB, returning HTTP 201 Created.")
    add_bullet_point(doc, "PUT /api/campaigns/:id & DELETE /api/campaigns/:id: ", "Handles administrative updates and deletions of existing campaign records.")
    add_bullet_point(doc, "POST /api/campaigns/review: ", "The AI review proxy gateway. Ingests campaign parameters from the frontend, dispatches an asynchronous HTTP POST request using Node's native fetch API to the Python FastAPI microservice (http://127.0.0.1:5000/analyse), receives the trust score and breakdown, decorates the campaign object with status 'Pending AI Review', and returns the verified payload to the client.")

    # --- SECTION 4.6 ---
    add_heading_2(doc, "4.6 Client-Side Application Engineering - Donor Portal (frontend/src/App.jsx)")
    
    add_heading_3(doc, "4.6.1 Web3 Wallet Integration and Ethers.js v6 Lifecycle")
    add_body_paragraph(
        doc,
        "The Donor Portal provides a modern, responsive Web3 interface. Wallet connectivity is implemented using Ethers.js v6 "
        "BrowserProvider wrapping the window.ethereum injected provider. When the user initiates connection, the connectWallet function "
        "dispatches eth_requestAccounts. The returned account address is truncated for UI display (e.g., 0x9a8b...1a0b) and stored in "
        "top-level React state. If MetaMask is not detected, an instructional alert is rendered directing the user to install the extension."
    )

    add_heading_3(doc, "4.6.2 State Management and Theme Persistence")
    add_body_paragraph(
        doc,
        "AuraGive implements persistent dark mode state management across the single-page application. To eliminate visual theme flashing "
        "upon page reloads, the isDark state in App.jsx is initialized lazily using a function reading localStorage.getItem('theme') === 'dark'. "
        "A companion useEffect hook listens for mutations to isDark, synchronizing the active theme string ('dark' or 'light') back to "
        "localStorage and dynamically applying or removing the data-theme='dark' attribute on document.documentElement. This ensures that "
        "user aesthetic preferences persist seamlessly across route transitions and browser restarts."
    )

    add_heading_3(doc, "4.6.3 Dynamic Campaign Filtering and Search Engine")
    add_body_paragraph(
        doc,
        "The DonorDashboard component incorporates real-time client-side search and multi-criteria filtering. State hooks for searchTerm, "
        "categoryFilter, and locationFilter dynamically evaluate the campaigns array on every keystroke or dropdown selection. The UI "
        "instantly updates the visible campaign grid and renders the reactive count badge (e.g., 'Campaigns (3)'), providing instantaneous "
        "feedback without incurring redundant network round-trips."
    )

    add_heading_3(doc, "4.6.4 Interactive Donation Modal and Over-Allocation Guardrails")
    add_body_paragraph(
        doc,
        "When a donor navigates to a campaign details page (/campaign/:id) and clicks 'Donate Now', the DonateModal component opens. "
        "The modal performs client-side financial validation: it calculates the remaining funding goal (goal - raised) and continuously "
        "evaluates user input. If the donor enters an amount exceeding the remaining goal, the modal renders a prominent warning message: "
        "'Incorrect amount: You cannot donate more than the remaining goal of X USDC', while automatically disabling the 'Confirm Donation' "
        "button. Upon successful confirmation, handleConfirmDonation constructs a transaction record with a simulated 40-character "
        "blockchain hash, prepends it to global state, and navigates to the Transactions view."
    )

    add_heading_3(doc, "4.6.5 Explainable AI Trust Score Badge and Breakdown Tooltip")
    add_body_paragraph(
        doc,
        "Trust score visualization is implemented via dynamic CSS badge formatting (trust-high for scores >80, trust-med for 50–80, "
        "and trust-low for <50). To ensure explainability, hovering over the badge reveals an interactive trust-tooltip popover. "
        "The component splits the scoreBreakdown string on sentence delimiters and renders individual verification bullet points "
        "(e.g., 'School Identity: Verified', 'Location: Verified'), allowing donors to inspect the rationale behind the AI rating."
    )

    add_heading_3(doc, "4.6.6 Transparency Ledger and OCR Receipt Audit Viewer")
    add_body_paragraph(
        doc,
        "The Transactions view features a dual-tabbed transparency interface: 'My Donations' and 'Fund Expenditure (Receipts)'. "
        "The Donations tab renders a cryptographic ledger containing transaction dates, campaign titles, USDC amounts, status badges, "
        "and clickable transaction hashes deep-linking directly to https://amoy.polygonscan.com/tx/[hash]. The Fund Expenditure tab "
        "displays public milestone receipts, file attachments, and AI Optical Character Recognition (OCR) audit verification flags, "
        "providing complete public accountability."
    )

    # --- SECTION 4.7 ---
    add_heading_2(doc, "4.7 Administrative Dashboard Engineering (frontend-admin/src/App.jsx)")
    
    add_heading_3(doc, "4.7.1 Campaign Creation and Multi-Stage AI Evaluation UI")
    add_body_paragraph(
        doc,
        "The Administrative Dashboard provides platform managers with campaign onboarding tools. In the CreateCampaignView component, "
        "administrators input campaign metadata (Title, Category, District, Remoteness, Requested USDC, Scale Index, Description, Image URL). "
        "Clicking 'Generate AI Trust Score' triggers the AI evaluation pipeline, displaying a real-time loader before revealing the "
        "computed Trust Score percentage badge and validation status. Only after reviewing the AI rating can the administrator click "
        "'Publish to Network', which persists the campaign to the backend and deploys the escrow parameters."
    )

    add_heading_3(doc, "4.7.2 Real-Time Platform Analytics and Lifecycle Management")
    add_body_paragraph(
        doc,
        "The AdminDashboard utilizes React's useMemo hook to compute high-performance aggregate financial metrics across all campaigns, "
        "including Active Campaign Count, Total Raised Funds (formatted in USDC currency), Target Goal Total, and Platform Average Trust "
        "Score. Administrators can view, edit, or delete existing campaigns, with optimistic UI updates synchronizing state immediately "
        "upon successful REST API execution."
    )

    print("Section 4.3 to 4.7 generated.")
