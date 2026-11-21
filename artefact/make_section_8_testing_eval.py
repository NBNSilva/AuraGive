# -*- coding: utf-8 -*-
"""
Section 8 Builder:
- 4.10 Comprehensive Verification, Validation, and Test Case Matrix (30 Test Cases TC-01 to TC-30)
- 4.11 Master Screenshot Capture Directory & Visual Asset Placement Guide
- 4.12 Critical System Evaluation, Security Audit, Limitations & Future Roadmap
- 4.13 References (Formal Harvard/IEEE Bibliography)
"""

from docx_format_utils import (
    add_heading_2, add_heading_3,
    add_body_paragraph, add_bullet_point,
    format_table_header, format_table_row, BLACK
)
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def build_testing_and_eval(doc):
    # --- SECTION 4.10 ---
    add_heading_2(doc, "4.10 Comprehensive Verification, Validation, and Test Case Matrix")
    
    add_body_paragraph(
        doc,
        "To rigorously validate the functional correctness, security, state synchronization, and algorithmic accuracy of the AuraGive "
        "artefact, an exhaustive test suite comprising thirty (30) test cases was designed and executed. The test cases span functional "
        "unit tests, positive and negative integration tests, asynchronous API gateway evaluations, smart contract role-based access tests, "
        "and end-to-end system validation workflows across both the Donor Portal and Admin Dashboard."
    )

    test_cases_data = [
        ("TC-01", "Successful User Sign In with Email", "Auth - Donor", "Unit", "1. Enter valid email & password.\n2. Click Sign In.", "User authenticated; dashboard loads successfully.", "PASS"),
        ("TC-02", "Sign In with Empty Required Fields", "Auth - Donor", "Unit (–ve)", "1. Leave email & password empty.\n2. Click Sign In.", "HTML5 validation triggers; form submission blocked.", "PASS"),
        ("TC-03", "Auto-Auth via Web3 Wallet", "Auth - Web3", "Integration", "1. Click 'Connect Web3 Wallet'.\n2. Approve MetaMask popup.", "Wallet address auto-populates user identity; dashboard loads.", "PASS"),
        ("TC-04", "Connect Wallet from Navbar", "Wallet - Navbar", "Integration", "1. Click Connect Wallet in navbar.\n2. Approve MetaMask.", "Navbar renders truncated address (0x9a8b...1a0b).", "PASS"),
        ("TC-05", "Wallet Persistence Across Navigation", "Wallet - Router", "Integration", "1. Connect wallet on Explore.\n2. Route to /transactions.\n3. Return to /.", "Connected wallet address persists across route changes without disconnect.", "PASS"),
        ("TC-06", "Wallet Dropdown Balance Display", "Wallet - Dropdown", "Unit", "1. Click connected wallet pill in navbar.", "Dropdown opens displaying Polygon Amoy network, 150.00 USDC, 0.5 MATIC.", "PASS"),
        ("TC-07", "Disconnect Wallet Action", "Wallet - Disconnect", "Unit", "1. Open wallet menu.\n2. Click 'Disconnect Wallet'.", "Wallet state cleared; UI reverts to 'Connect Wallet' button.", "PASS"),
        ("TC-08", "Dark Mode Persistence Across Pages", "Theme - Router", "System", "1. Toggle dark mode on Explore.\n2. Navigate to /transactions and /campaign/1.", "Dark theme (data-theme='dark') persists on all pages with zero visual flash.", "PASS"),
        ("TC-09", "Dark Mode Survival Across Page Reload", "Theme - Storage", "Unit", "1. Enable dark mode.\n2. Hard reload browser (Ctrl+F5).", "isDark state hydrated immediately from localStorage; dark mode active on first paint.", "PASS"),
        ("TC-10", "Search Filter by Keyword", "Explore - Search", "Unit", "1. Type 'water' into Explore search bar.", "Only 'Clean Drinking Water Well' displayed; campaign counter displays (1).", "PASS"),
        ("TC-11", "Filter Campaigns by Category", "Explore - Filter", "Unit", "1. Select 'Sanitation' from Category dropdown.", "Grid renders only Sanitation campaigns; counter updates accurately.", "PASS"),
        ("TC-12", "Filter Campaigns by District Location", "Explore - Filter", "Unit", "1. Select 'Kandy' from Location dropdown.", "Grid displays only Kandy-located school campaigns; others hidden.", "PASS"),
        ("TC-13", "Navigate to Campaign Details", "Campaign - Nav", "Integration", "1. Click campaign card on Explore grid.", "React Router transitions to /campaign/:id with full campaign and milestone data.", "PASS"),
        ("TC-14", "AI Trust Score Tooltip on Hover", "Detail - Tooltip", "Unit", "1. Hover cursor over AI Trust Score badge.", "Interactive tooltip popover renders with itemized NLP verification checks.", "PASS"),
        ("TC-15", "Donate Attempt Without Connected Wallet", "Detail - Donate", "Unit (–ve)", "1. Click 'Donate Now' without connecting wallet.", "Alert displays: 'Please connect your wallet first'; modal remains closed.", "PASS"),
        ("TC-16", "Donation Modal Opens with Correct Target", "Detail - Modal", "Unit", "1. Connect wallet.\n2. Click 'Donate Now'.", "Modal renders with campaign title and remaining goal indicator.", "PASS"),
        ("TC-17", "Donation Amount Exceeding Remaining Goal", "Modal - Guardrail", "Unit (–ve)", "1. Enter amount > remaining goal (e.g. 5000 for 800 remaining).\n2. Observe CTA.", "Validation error displayed: 'Incorrect amount'; Confirm button strictly disabled.", "PASS"),
        ("TC-18", "Negative / Zero Donation Amount", "Modal - Validate", "Unit (–ve)", "1. Enter -50 or 0 in amount field.", "Confirm Donation button remains disabled; negative input rejected.", "PASS"),
        ("TC-19", "Successful Donation State Mutation", "Donation - Flow", "System", "1. Enter valid amount (50 USDC).\n2. Click Confirm Donation.", "Success alert shown; transaction prepended to global state; navigated to /transactions.", "PASS"),
        ("TC-20", "Admin Campaign Form Validation", "Admin - Validate", "Unit (–ve)", "1. Leave Title or Description empty.\n2. Click Submit.", "Browser form validation halts submission; required fields highlighted.", "PASS"),
        ("TC-21", "Admin AI Score Generation Trigger", "Admin - Review", "Integration", "1. Fill form with school description.\n2. Click 'Generate AI Trust Score'.", "Loading spinner renders; AI response updates Trust Score badge (e.g. 95% High Trust).", "PASS"),
        ("TC-22", "High Trust Score (Verified School & Location)", "AI - NER Tier 1", "System", "1. Submit description containing 'Galgamuwa Kanishta Vidyalaya' with district 'Kurunegala'.", "FastAPI returns trust_score=95, status='High Trust', with both identity and location verified.", "PASS"),
        ("TC-23", "Medium Trust Score (District Mismatch)", "AI - NER Tier 2", "System", "1. Submit 'Kiran Maha Vidyalaya' (Batticaloa) with claimed district 'Colombo'.", "FastAPI returns trust_score=65, status='Medium Trust', with location warning in breakdown.", "PASS"),
        ("TC-24", "Low Trust Score (Unregistered School)", "AI - NER Tier 3", "System", "1. Submit description containing non-existent fictitious school name.", "FastAPI returns trust_score=25, status='Low Trust' ('School not found in registry').", "PASS"),
        ("TC-25", "Random Forest Predictive Classification", "AI - RF Model", "Unit", "1. Post campaign parameters to /predict-trust.", "Joblib model computes probability; returns 'Approved', 'Flagged', or 'Rejected'.", "PASS"),
        ("TC-26", "Smart Contract Campaign Creation", "Solidity - Escrow", "Unit", "1. Invoke createCampaign() with title, CID, goal.", "Contract assigns monotonic campaignId, emits CampaignCreated event.", "PASS"),
        ("TC-27", "Smart Contract Token Deposit via SafeERC20", "Solidity - Deposit", "Integration", "1. Approve USDC allowance.\n2. Invoke donate(campaignId, amount).", "Tokens transferred to escrow contract; raisedAmount incremented; DonationReceived emitted.", "PASS"),
        ("TC-28", "Non-Admin Milestone Approval Rejection", "Solidity - RBAC", "Security (–ve)", "1. Call approveMilestone() from non-admin address.", "Transaction reverts with AccessControl unauthorized role error.", "PASS"),
        ("TC-29", "Polygonscan Transaction Deep-Linking", "Ledger - Explorer", "Integration", "1. Navigate to /transactions.\n2. Click transaction hash badge.", "New browser tab opens securely to https://amoy.polygonscan.com/tx/[hash].", "PASS"),
        ("TC-30", "Empty State Ledger Handling", "Ledger - Empty", "Unit", "1. Navigate to /transactions with zero donation history.", "Table body displays: 'No donations found. Visit the Explore tab to support a campaign.'", "PASS")
    ]

    table = doc.add_table(rows=len(test_cases_data) + 1, cols=7)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    col_widths = [0.6, 1.2, 0.9, 0.7, 1.3, 1.4, 0.4]
    
    # Headers
    headers = ["TC ID", "Test Case Title", "Module", "Type", "Test Steps", "Expected Result", "Status"]
    for idx, name in enumerate(headers):
        table.cell(0, idx).paragraphs[0].text = name
    format_table_header(table.rows[0], col_widths)

    # Rows
    for row_idx, data in enumerate(test_cases_data):
        row = table.rows[row_idx + 1]
        for col_idx, text in enumerate(data):
            row.cells[col_idx].paragraphs[0].text = text
        format_table_row(row, col_widths)

    doc.add_page_break()

    # --- SECTION 4.11 ---
    add_heading_2(doc, "4.11 Master Screenshot Capture Directory & Visual Asset Placement Guide")
    
    add_body_paragraph(
        doc,
        "The following master reference catalog details all ten (10) critical code screenshot figures required for physical submission. "
        "Developers and evaluators can cross-reference the target source files, line ranges, and capture instructions against the boxed "
        "placeholders established in Section 4.9."
    )

    catalog_data = [
        ("Fig 1", "frontend/src/App.jsx", "42–54", "async connectWallet function with BrowserProvider and eth_requestAccounts", "Section 4.9.1", "Figure 1: MetaMask Wallet Connection Function"),
        ("Fig 2", "frontend/src/App.jsx", "754–762", "Root isDark useState reading localStorage and synchronization useEffect", "Section 4.9.2", "Figure 2: Persistent Dark Mode State and LocalStorage Hook"),
        ("Fig 3", "frontend/src/App.jsx", "224–237", "handleConfirmDonation constructing newTx and routing to /transactions", "Section 4.9.3", "Figure 3: Donation Confirmation and State Update Handler"),
        ("Fig 4", "frontend/src/App.jsx", "264–277", "trust-badge-container and trust-tooltip rendering split score breakdown", "Section 4.9.4", "Figure 4: AI Trust Score Badge and Hover Tooltip Component"),
        ("Fig 5", "frontend-admin/src/App.jsx", "261–326", "CreateCampaignView form inputs and 'Generate AI Trust Score' trigger", "Section 4.9.5", "Figure 5: Admin Campaign Creation and AI Dispatch Form"),
        ("Fig 6", "frontend/src/App.jsx", "684–693", "Anchor tag dynamically constructing amoy.polygonscan.com/tx/[hash] link", "Section 4.9.6", "Figure 6: Polygonscan Dynamic Anchor Link Rendering"),
        ("Fig 7", "contracts/DonationEscrow.sol", "58–69, 112–125", "Solidity donate() and releaseFunds() using SafeERC20 safeTransfer methods", "Section 4.9.7", "Figure 7: Solidity Escrow Donation and SafeERC20 Release Functions"),
        ("Fig 8", "backend-ai/app.py", "45–113", "FastAPI /analyse route with spaCy entity matching and 3-tier scoring", "Section 4.9.8", "Figure 8: FastAPI spaCy NER Entity Extraction and Scoring Route"),
        ("Fig 9", "backend-ai/train_model.py", "44–64", "RandomForestClassifier training pipeline and Joblib serialization", "Section 4.9.9", "Figure 9: Supervised Random Forest Model Training Pipeline"),
        ("Fig 10", "backend-node/server.js", "168–205", "Express POST /api/campaigns/review proxy gateway forwarding to FastAPI", "Section 4.9.10", "Figure 10: Express AI Review Forwarding Gateway Route")
    ]

    cat_table = doc.add_table(rows=len(catalog_data) + 1, cols=6)
    cat_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cat_widths = [0.6, 1.4, 0.7, 1.8, 0.8, 1.2]
    
    cat_headers = ["Figure", "Source File", "Lines", "Specific Code Elements to Capture", "Location", "Caption"]
    for idx, name in enumerate(cat_headers):
        cat_table.cell(0, idx).paragraphs[0].text = name
    format_table_header(cat_table.rows[0], cat_widths)

    for row_idx, data in enumerate(catalog_data):
        row = cat_table.rows[row_idx + 1]
        for col_idx, text in enumerate(data):
            row.cells[col_idx].paragraphs[0].text = text
        format_table_row(row, cat_widths, align_left_cols=(1, 3, 5))

    doc.add_page_break()

    # --- SECTION 4.12 ---
    add_heading_2(doc, "4.12 Critical Evaluation, Security Auditing, Limitations, and Future Roadmap")
    
    add_heading_3(doc, "4.12.1 Security Analysis and Attack Vector Mitigation")
    add_body_paragraph(
        doc,
        "A rigorous security evaluation of the AuraGive architecture was conducted to identify potential vulnerabilities across both "
        "on-chain and off-chain operational surfaces:"
    )
    add_bullet_point(doc, "Reentrancy Attacks: ", "Mitigated in DonationEscrow.sol through strict adherence to the Checks-Effects-Interactions pattern and the utilization of OpenZeppelin's SafeERC20 library. State mutations (e.g., setting m.isReleased = true) occur strictly prior to external token transfers, eliminating recursive call vulnerabilities.")
    add_bullet_point(doc, "Oracle and AI Manipulation: ", "Because the AI verification pipeline operates as an off-chain microservice, adversarial actors could attempt prompt injection or adversarial phrasing in campaign descriptions. This risk is countered by the deterministic gazetteer validation layer, which requires verifiable school names in official databases regardless of descriptive phrasing.")
    add_bullet_point(doc, "Sybil Campaign Submissions: ", "Prevented on-chain by requiring administrative cryptographic approval (approveMilestone) prior to fund release, preventing malicious actors from extracting pledged capital even if a synthetic campaign bypasses initial automated filters.")

    add_heading_3(doc, "4.12.2 Architectural Limitations")
    add_body_paragraph(
        doc,
        "Despite its substantial innovations, the current prototype of AuraGive exhibits several technical limitations that represent "
        "valuable opportunities for continued engineering development:"
    )
    add_bullet_point(doc, "Centralized Administrative Approval: ", "Milestone releases currently require approval from an address holding ADMIN_ROLE. While secure, this re-introduces a centralized trust dependency for dispute resolution.")
    add_bullet_point(doc, "In-Memory Prototype State: ", "Certain development transactions and simulated testnet hashes are stored in client-side memory or local state, requiring full on-chain RPC indexer integration (e.g., The Graph Subgraph) for enterprise production.")
    add_bullet_point(doc, "Static Gazetteer Coverage: ", "The schools dataset is currently static; dynamic synchronization with live government educational ministry APIs would enhance coverage across all national administrative divisions.")

    add_heading_3(doc, "4.12.3 Future Research and Development Roadmap")
    add_body_paragraph(
        doc,
        "To elevate AuraGive to enterprise-grade production, the following four-phase development roadmap is formulated:"
    )
    add_bullet_point(doc, "Decentralized Oracle Networks (Chainlink DONs): ", "Replacing the centralized AI oracle with a decentralized Chainlink Function consensus network that executes off-chain NLP inference across multiple independent oracle nodes.")
    add_bullet_point(doc, "Zero-Knowledge Donation Proofs (zk-SNARKs): ", "Implementing zk-proofs (via Circom / snarkjs) to enable donors to verify that their contributions funded specific educational materials without publicly exposing their wallet balances or personal financial history.")
    add_bullet_point(doc, "Multi-Party Community Milestone Sign-off: ", "Decentralizing milestone approvals through a multi-signature voting mechanism involving school principals, parent-teacher associations (PTAs), and independent field auditors.")
    add_bullet_point(doc, "Decentralized Storage Pinning & Mobile Native Apps: ", "Integrating automated IPFS pinning services (Pinata/Filecoin) and compiling native React Native mobile clients for donors and field verifiers.")

    # --- SECTION 4.13 ---
    add_heading_2(doc, "4.13 References")
    
    references = [
        "Antonopoulos, A. M. and Wood, G. (2018). Mastering Ethereum: Building Smart Contracts and DApps. Sebastopol, CA: O'Reilly Media.",
        "Buterin, V. (2014). Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform. Ethereum Whitepaper.",
        "Ethereum Foundation (2024). Ethers.js v6 Developer Documentation. Available at: https://docs.ethers.org/v6 [Accessed 20 July 2026].",
        "FastAPI Documentation (2024). FastAPI: Modern, High-Performance Web Framework for Python. Available at: https://fastapi.tiangolo.com [Accessed 22 July 2026].",
        "Honnibal, M. and Montani, I. (2017). spaCy 2: Natural Language Understanding with Bloom Embeddings, Convolutional Neural Networks and Incremental Parsing. Sentometrics Research.",
        "MongoDB, Inc. (2024). Mongoose Object Data Modeling (ODM) Reference Documentation. Available at: https://mongoosejs.com [Accessed 18 July 2026].",
        "Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System. Cryptography Mailing List.",
        "OpenZeppelin (2024). OpenZeppelin Contracts v5.0: Standard and Secure Smart Contract Libraries for Solidity. Available at: https://openzeppelin.com/contracts [Accessed 15 July 2026].",
        "Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V. and Vanderplas, J. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, pp. 2825-2830.",
        "Polygon Technology (2024). Polygon PoS and Amoy Testnet Architectural Specifications. Available at: https://docs.polygon.technology [Accessed 19 July 2026].",
        "React Documentation (2024). React 18: The Library for Web and Native User Interfaces. Meta Open Source. Available at: https://react.dev [Accessed 21 July 2026].",
        "Vite Core Team (2024). Vite: Next Generation Frontend Tooling. Available at: https://vitejs.dev [Accessed 20 July 2026]."
    ]

    for ref in references:
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_ref.paragraph_format.space_before = Pt(2)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.15
        p_ref.paragraph_format.left_indent = Inches(0.5)
        p_ref.paragraph_format.first_line_indent = Inches(-0.5)
        
        run_ref = p_ref.add_run(ref)
        run_ref.font.name = 'Times New Roman'
        run_ref.font.size = Pt(11)
        run_ref.font.color.rgb = BLACK

    print("Section 4.10, 4.11, 4.12, 4.13 generated.")
