# -*- coding: utf-8 -*-
"""
Section 7 Builder:
- 4.9 Selected Source Code Implementations & Step-by-Step Developer Guides
  (10 Complete Listings with Logic Walkthroughs, Variable Dictionaries & Boxed Screenshot Placeholders)
"""

from docx_format_utils import (
    add_heading_2, add_heading_3,
    add_body_paragraph, add_bullet_point,
    add_screenshot_placeholder, BLACK
)
import docx
from docx.shared import Pt

def build_code_guides(doc):
    add_heading_2(doc, "4.9 Selected Source Code Implementations & Step-by-Step Developer Guides")
    
    add_body_paragraph(
        doc,
        "This section presents a rigorous developer walkthrough of ten critical source code implementations across the AuraGive "
        "codebase. Each subsection provides the precise file path and line numbers, a detailed variable dictionary, a step-by-step "
        "algorithmic walkthrough of the logic flow, and a structured screenshot capture placeholder indicating exactly what code "
        "block to capture and where to insert it in the finalized physical document."
    )

    # 4.9.1
    add_heading_3(doc, "4.9.1 MetaMask Web3 Wallet Connection (frontend/src/App.jsx)")
    add_body_paragraph(
        doc,
        "The connectWallet function manages the Web3 wallet connection lifecycle within the Donor Portal navigation bar. It interacts "
        "with the browser's injected Ethereum provider using the Ethers.js v6 BrowserProvider wrapper."
    )
    add_bullet_point(doc, "File Location: ", "frontend/src/App.jsx (Lines 42–54)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "window.ethereum (Injected EVM provider object), provider (Ethers.js v6 BrowserProvider instance), accounts (Array of authorized hex addresses returned from eth_requestAccounts), setWalletAddress (React state updater hook).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) The function checks for the presence of window.ethereum. If undefined, it triggers an instructional alert "
        "directing the user to install MetaMask. (2) It initializes a new ethers.BrowserProvider wrapping window.ethereum. (3) It calls "
        "provider.send('eth_requestAccounts', []), prompting the MetaMask extension popup. (4) Upon donor approval, the first account "
        "(accounts[0]) is passed to setWalletAddress, which updates the global React state and triggers dynamic UI updates in the navigation bar."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="1",
        title="MetaMask Wallet Connection Function",
        target_file="frontend/src/App.jsx",
        line_range="Lines 42 to 54 (connectWallet function definition)",
        capture_instructions="Capture the entire async connectWallet function from line 42 to line 54 in frontend/src/App.jsx. Ensure window.ethereum check, new ethers.BrowserProvider instantiation, provider.send call, and setWalletAddress call are clearly visible with line numbers in your IDE.",
        placement_guide="Insert immediately beneath the 4.9.1 Logic Walkthrough paragraph above."
    )

    # 4.9.2
    add_heading_3(doc, "4.9.2 Persistent Dark Mode Synchronization with localStorage (frontend/src/App.jsx)")
    add_body_paragraph(
        doc,
        "The theme management subsystem ensures that dark/light mode UI preferences persist across route navigation, component re-mounts, "
        "and browser sessions without visual flickering."
    )
    add_bullet_point(doc, "File Location: ", "frontend/src/App.jsx (Lines 754–762 & Lines 6–19)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "isDark (Boolean state holding current theme mode), setIsDark (State setter function), localStorage (Browser Web Storage API), data-theme (HTML root DOM attribute).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) In App(), useState is initialized with a lazy evaluation function: () => localStorage.getItem('theme') === 'dark'. "
        "This synchronous check guarantees that the DOM receives the correct theme state on the initial paint. (2) A useEffect hook listens "
        "for changes to isDark and writes the value ('dark' or 'light') to localStorage. (3) In the ThemeToggle component, an independent "
        "useEffect toggles document.documentElement.setAttribute('data-theme', 'dark') or removeAttribute, triggering global Tailwind dark CSS rules."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="2",
        title="Persistent Dark Mode State and LocalStorage Hook",
        target_file="frontend/src/App.jsx",
        line_range="Lines 754 to 762 (Theme state initialization and useEffect in App component)",
        capture_instructions="Capture lines 754 to 762 of frontend/src/App.jsx showing the lazy useState reading localStorage.getItem('theme') and the useEffect persisting changes back to localStorage.",
        placement_guide="Insert immediately beneath the 4.9.2 Logic Walkthrough paragraph above."
    )

    # 4.9.3
    add_heading_3(doc, "4.9.3 Donation Confirmation and Transaction State Update (frontend/src/App.jsx)")
    add_body_paragraph(
        doc,
        "The handleConfirmDonation function executes upon the donor submitting a valid USDC donation amount in the DonateModal, "
        "creating a cryptographic transaction record and updating global state."
    )
    add_bullet_point(doc, "File Location: ", "frontend/src/App.jsx (Lines 224–237)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "amount (Numeric donation amount in USDC), newTx (Transaction object containing id, date, campaignTitle, amount, status, and hash), transactions (Global state array of transactions), setTransactions (State updater), navigate (React Router navigation hook).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) In CampaignDetail, the donor enters an amount and clicks Confirm Donation. (2) handleConfirmDonation instantiates "
        "newTx with Date.now(), today's ISO date, campaign.title, amount formatted to 2 decimal places, status 'Confirmed', and a simulated "
        "40-character blockchain hash (0x...). (3) setTransactions([newTx, ...transactions]) prepends the transaction to global state. "
        "(4) The modal closes, a success alert is shown, and navigate('/transactions') routes the donor to the transparency ledger."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="3",
        title="Donation Confirmation and State Update Handler",
        target_file="frontend/src/App.jsx",
        line_range="Lines 224 to 237 (handleConfirmDonation function definition)",
        capture_instructions="Capture lines 224 to 237 in frontend/src/App.jsx showing the construction of newTx, setTransactions update, modal closure, and navigation routing to /transactions.",
        placement_guide="Insert immediately beneath the 4.9.3 Logic Walkthrough paragraph above."
    )

    # 4.9.4
    add_heading_3(doc, "4.9.4 Explainable AI Trust Score Badge & Dynamic Breakdown Tooltip (frontend/src/App.jsx)")
    add_body_paragraph(
        doc,
        "The Trust Score UI renders a color-coded verification badge with an interactive hover tooltip popover detailing the specific "
        "NLP and gazetteer validation results."
    )
    add_bullet_point(doc, "File Location: ", "frontend/src/App.jsx (Lines 264–277)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "campaign.score (Integer trust rating 0–100), campaign.scoreBreakdown (Dot-delimited string of verification checks), trust-badge (CSS class container), trust-tooltip (CSS hover popover div).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) The trust badge evaluates campaign.score, applying class trust-high (>80), trust-med (>50), or trust-low (<50). "
        "(2) Inside trust-badge-container, a child trust-tooltip div is positioned with CSS hover visibility. (3) The component splits "
        "campaign.scoreBreakdown using .split('. ').filter(Boolean) and maps each element into a structured <li> tag inside the popover. "
        "(4) A CSS arrow indicator (trust-tooltip-arrow) visually anchors the tooltip to the badge."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="4",
        title="AI Trust Score Badge and Hover Tooltip Component",
        target_file="frontend/src/App.jsx",
        line_range="Lines 264 to 277 (JSX markup for trust-badge-container and trust-tooltip)",
        capture_instructions="Capture lines 264 to 277 in frontend/src/App.jsx showing the trust badge JSX, class condition, and scoreBreakdown string splitting inside the tooltip list.",
        placement_guide="Insert immediately beneath the 4.9.4 Logic Walkthrough paragraph above."
    )

    # 4.9.5
    add_heading_3(doc, "4.9.5 Admin Campaign Creation and AI Dispatch Form (frontend-admin/src/App.jsx)")
    add_body_paragraph(
        doc,
        "The CreateCampaignView component in the Admin Portal collects campaign parameters and triggers the AI analysis pipeline "
        "before permitting network publication."
    )
    add_bullet_point(doc, "File Location: ", "frontend-admin/src/App.jsx (Lines 261–326)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "title, category, location, remoteness, requestedUsd, scaleIndex, description, image (Form state variables), handlePredict (Form submit handler), isLoading (Loading spinner state), trustScore (Computed AI score).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) The admin inputs campaign metadata into the multi-attribute grid form. (2) Submitting the form calls handlePredict, "
        "which sets isLoading(true) and sends an HTTP POST request to the backend review gateway. (3) Upon response, trustScore and verification "
        "status are displayed in an animated review banner. (4) The 'Publish to Network' button is enabled only after successful AI verification."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="5",
        title="Admin Campaign Creation and AI Dispatch Form",
        target_file="frontend-admin/src/App.jsx",
        line_range="Lines 261 to 326 (CreateCampaignView form JSX and submission handler)",
        capture_instructions="Capture lines 261 to 326 of frontend-admin/src/App.jsx showing form inputs (Title, Category, District, Remoteness, Goal, Description) and the 'Generate AI Trust Score' submit button.",
        placement_guide="Insert immediately beneath the 4.9.5 Logic Walkthrough paragraph above."
    )

    # 4.9.6
    add_heading_3(doc, "4.9.6 Dynamic Polygonscan Block Explorer Transaction Linking (frontend/src/App.jsx)")
    add_body_paragraph(
        doc,
        "The Transactions ledger renders transparent blockchain proof by converting transaction hashes into clickable hyperlinks "
        "pointing to the public Polygon Amoy block explorer."
    )
    add_bullet_point(doc, "File Location: ", "frontend/src/App.jsx (Lines 684–693)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "tx.hash (Hexadecimal transaction hash string), href (Constructed block explorer URL), target='_blank', rel='noreferrer' (Secure anchor attributes), hash-badge (CSS pill badge styling).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) For each transaction in transactions.map(tx => ...), an anchor tag <a> is constructed. (2) href is dynamically "
        "bound to `https://amoy.polygonscan.com/tx/${tx.hash}`. (3) target='_blank' and rel='noreferrer' ensure secure opening in a new tab. "
        "(4) The displayed text is truncated for readability using `${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}`."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="6",
        title="Polygonscan Dynamic Anchor Link Rendering",
        target_file="frontend/src/App.jsx",
        line_range="Lines 684 to 693 (Table cell rendering Polygonscan link and truncated hash)",
        capture_instructions="Capture lines 684 to 693 in frontend/src/App.jsx showing the anchor element, dynamic href construction to amoy.polygonscan.com, and hash truncation logic.",
        placement_guide="Insert immediately beneath the 4.9.6 Logic Walkthrough paragraph above."
    )

    # 4.9.7
    add_heading_3(doc, "4.9.7 Smart Contract Donation & SafeERC20 Milestone Release (smart-contracts/contracts/DonationEscrow.sol)")
    add_body_paragraph(
        doc,
        "The core financial escrow logic in Solidity executes non-custodial token deposits and phased milestone disbursements using "
        "OpenZeppelin's SafeERC20."
    )
    add_bullet_point(doc, "File Location: ", "smart-contracts/contracts/DonationEscrow.sol (Lines 58–69 & Lines 112–125)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "campaignId, amount, usdcToken (IERC20 instance), SafeERC20 (Safe transfer library), milestones (Nested mapping of milestone structs), FundsReleased (Emitted event).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) donate() validates require(campaigns[campaignId].isActive), require(campaigns[campaignId].isVerified), and "
        "require(amount > 0). It calls usdcToken.safeTransferFrom(msg.sender, address(this), amount) and increments raisedAmount. (2) releaseFunds() "
        "validates require(msg.sender == campaigns[campaignId].ngoWallet), require(m.isApproved), and require(!m.isReleased). It sets m.isReleased = true, "
        "calls usdcToken.safeTransfer(msg.sender, m.amount), and emits FundsReleased."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="7",
        title="Solidity Escrow Donation and SafeERC20 Release Functions",
        target_file="smart-contracts/contracts/DonationEscrow.sol",
        line_range="Lines 58 to 69 (donate function) and Lines 112 to 125 (releaseFunds function)",
        capture_instructions="Capture lines 58 to 69 and lines 112 to 125 of DonationEscrow.sol in your Solidity editor showing safeTransferFrom, state validations, and safeTransfer token release.",
        placement_guide="Insert immediately beneath the 4.9.7 Logic Walkthrough paragraph above."
    )

    # 4.9.8
    add_heading_3(doc, "4.9.8 FastAPI spaCy Named Entity Recognition Analysis Route (backend-ai/app.py)")
    add_body_paragraph(
        doc,
        "The /analyse route in Python FastAPI parses campaign narratives using spaCy NLP, extracts organizational and geographical entities, "
        "and computes the deterministic trust rating."
    )
    add_bullet_point(doc, "File Location: ", "backend-ai/app.py (Lines 45–113)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "nlp (Loaded spaCy en_core_web_sm pipeline), doc (Parsed Doc object), extracted_orgs (List of ORG entities), extracted_locs (List of GPE/LOC entities), df_schools (Pandas DataFrame of verified schools).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) doc = nlp(req.description) extracts named entities. (2) Extracted ORGs are matched against df_schools['School_Name_Lower']. "
        "(3) If no match is found, raw text substring fallback is executed; if still unfound, trust_score=25 (Low Trust) is returned. (4) If found, "
        "district match is verified against db_district. If matched, trust_score=95 (High Trust); if mismatched, trust_score=65 (Medium Trust)."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="8",
        title="FastAPI spaCy NER Entity Extraction and Scoring Route",
        target_file="backend-ai/app.py",
        line_range="Lines 45 to 113 (analyse_campaign function in FastAPI)",
        capture_instructions="Capture lines 45 to 113 of backend-ai/app.py showing the Pydantic request ingestion, spaCy entity filtering for ORG/GPE, dataset query matching, and 3-tier scoring logic.",
        placement_guide="Insert immediately beneath the 4.9.8 Logic Walkthrough paragraph above."
    )

    # 4.9.9
    add_heading_3(doc, "4.9.9 Supervised Random Forest Classifier Model Generation (backend-ai/train_model.py)")
    add_body_paragraph(
        doc,
        "The training script generates a synthetic multi-variable dataset, fits a Random Forest classifier using scikit-learn, "
        "and serializes the trained model artifact."
    )
    add_bullet_point(doc, "File Location: ", "backend-ai/train_model.py (Lines 44–64)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "create_synthetic_dataset (Data generator function), train_test_split (Cross-validation split), clf (RandomForestClassifier instance with n_estimators=100), joblib.dump (Model serializer).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) train() generates 2,000 synthetic campaign samples containing 5 continuous/binary risk features. (2) Data is split "
        "into 80% train and 20% test partitions using train_test_split(..., test_size=0.2, random_state=42). (3) clf = RandomForestClassifier(n_estimators=100, "
        "random_state=42) fits the training matrix. (4) Accuracy is evaluated on test data, and the model is saved to models/trust_score_model.pkl via joblib."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="9",
        title="Supervised Random Forest Model Training Pipeline",
        target_file="backend-ai/train_model.py",
        line_range="Lines 44 to 64 (train function definition)",
        capture_instructions="Capture lines 44 to 64 of backend-ai/train_model.py showing synthetic dataset generation, train_test_split call, RandomForestClassifier fit call, and joblib.dump serialization.",
        placement_guide="Insert immediately beneath the 4.9.9 Logic Walkthrough paragraph above."
    )

    # 4.9.10
    add_heading_3(doc, "4.9.10 Express AI Review Proxy and Campaign Data Gateway (backend-node/server.js)")
    add_body_paragraph(
        doc,
        "The /api/campaigns/review endpoint in Node.js acts as an asynchronous API gateway, dispatching HTTP payloads to the Python AI "
        "service and returning a decorated campaign object."
    )
    add_bullet_point(doc, "File Location: ", "backend-node/server.js (Lines 168–205)")
    add_bullet_point(doc, "Key Variables & Interfaces: ", "req.body (Incoming campaign parameters), aiResponse (Asynchronous fetch response from FastAPI), aiData (Parsed JSON containing trust_score and breakdown), campaignData (Decorated campaign object).")
    add_body_paragraph(
        doc,
        "Logic Walkthrough: (1) Express receives POST /api/campaigns/review with campaign metadata. (2) It executes an asynchronous fetch call to "
        "http://127.0.0.1:5000/analyse passing description and district. (3) If the AI response is valid, it extracts aiData.trust_score and "
        "aiData.breakdown. (4) It constructs campaignData with status 'Pending AI Review' and the AI ratings, returning HTTP 200 to the client."
    )
    add_screenshot_placeholder(
        doc,
        figure_no="10",
        title="Express AI Review Forwarding Gateway Route",
        target_file="backend-node/server.js",
        line_range="Lines 168 to 205 (POST /api/campaigns/review endpoint handler)",
        capture_instructions="Capture lines 168 to 205 in backend-node/server.js showing the fetch dispatch to http://127.0.0.1:5000/analyse, error handling, and decorated campaignData JSON response construction.",
        placement_guide="Insert immediately beneath the 4.9.10 Logic Walkthrough paragraph above."
    )

    print("Section 4.9 (10 Code Walkthroughs with Placeholders) generated.")
