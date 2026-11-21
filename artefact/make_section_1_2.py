# -*- coding: utf-8 -*-
"""
Section 1 and 2 Builder:
- Metadata & Cover Page
- Declaration of Originality & Copyright Licensing
- Table of Contents
- 4.1 Executive Summary & Problem Formulation
- 4.2 System Architecture, Decoupled Topology, Stack Justification & End-to-End Execution Sequence
"""

from docx_format_utils import (
    add_heading_1, add_heading_2, add_heading_3,
    add_body_paragraph, add_bullet_point, BLACK
)
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def build_cover_and_intro(doc):
    # --- COVER PAGE ---
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(12)
    
    r_uni = p_title.add_run("UNIVERSITY OF WOLVERHAMPTON\n")
    r_uni.bold = True
    r_uni.font.name = 'Times New Roman'
    r_uni.font.size = Pt(16)
    r_uni.font.color.rgb = BLACK
    
    r_fac = p_title.add_run("Faculty of Science and Engineering\nSchool of Computer Science and Mathematics\n\n")
    r_fac.bold = False
    r_fac.font.name = 'Times New Roman'
    r_fac.font.size = Pt(12)
    r_fac.font.color.rgb = BLACK

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.space_before = Pt(18)
    p_proj.paragraph_format.space_after = Pt(18)
    
    r_maintitle = p_proj.add_run("AI-BASED DONATION TRANSPARENCY PLATFORM USING BLOCKCHAIN\n(AURAGIVE)\n\n")
    r_maintitle.bold = True
    r_maintitle.font.name = 'Times New Roman'
    r_maintitle.font.size = Pt(18)
    r_maintitle.font.color.rgb = BLACK

    r_sub = p_proj.add_run("CHAPTER 04: SYSTEM ARTEFACT AND TECHNICAL IMPLEMENTATION\n")
    r_sub.bold = True
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(14)
    r_sub.font.color.rgb = BLACK

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_before = Pt(24)
    p_meta.paragraph_format.space_after = Pt(24)
    p_meta.paragraph_format.line_spacing = 1.3
    
    meta_text = (
        "Student Name: N. Benul Nethmitha Silva\n"
        "Student Identification Number: 2641622\n"
        "Module Code: 6CS007\n"
        "Module Title: Project and Professionalism\n"
        "Award Title: BSc (Hons) Computer Science (Software Engineering)\n"
        "Module Leader: Mr. Dhishan Dhammearatchi\n"
        "Project Supervisor: Ms. Eshandi Aththanayake\n"
        "Project Reader: Mr. Harindu Mansaka\n"
        "Submission Date: 26/07/2026\n"
    )
    r_meta = p_meta.add_run(meta_text)
    r_meta.font.name = 'Times New Roman'
    r_meta.font.size = Pt(11.5)
    r_meta.font.color.rgb = BLACK

    doc.add_page_break()

    # --- DECLARATION PAGE ---
    add_heading_1(doc, "Declaration of Authorship")
    
    add_body_paragraph(
        doc,
        "Presented in partial fulfilment of the assessment requirements for the award of Bachelor of Science (Honours) "
        "in Computer Science (Software Engineering) at the University of Wolverhampton."
    )
    add_body_paragraph(
        doc,
        "This work or any part thereof has not previously been presented in any form to the University or to any other "
        "institutional body whether for assessment or for other purposes. Save for any express acknowledgements, references, "
        "and bibliographies cited in the work, I confirm that the intellectual contents of this report and the accompanying "
        "software artefact are the result of my own independent efforts and of no other person."
    )
    add_body_paragraph(
        doc,
        "It is acknowledged that the author of any project work shall own the copyright. However, by submitting such copyright "
        "work for academic assessment, the author grants to the University a perpetual, royalty-free license to do all or any "
        "of those things referred to in section 16(i) of the Copyright Designs and Patents Act 1988 (namely: to copy the work; "
        "to issue copies to the public; to perform, show, or play the work in public; to broadcast the work; or to make an "
        "adaptation of the work for educational and institutional evaluation purposes)."
    )

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(30)
    p_sig.paragraph_format.space_after = Pt(6)
    r_sig = p_sig.add_run("Signature of the Student: ___________________________          Date: 26/07/2026")
    r_sig.font.name = 'Times New Roman'
    r_sig.font.size = Pt(12)
    r_sig.font.color.rgb = BLACK

    doc.add_page_break()

    # --- TABLE OF CONTENTS ---
    add_heading_1(doc, "Table of Contents")
    
    toc_items = [
        ("4.1 Executive Summary and System Rationale", "4"),
        ("    4.1.1 Socio-Economic Problem Context", "4"),
        ("    4.1.2 The AuraGive Solution Paradigm", "5"),
        ("    4.1.3 Scope of Technical Deliverables", "5"),
        ("4.2 System Architecture and High-Level Topology", "6"),
        ("    4.2.1 Multi-Tier Decoupled Architecture", "6"),
        ("    4.2.2 Technology Stack Justification and Analysis", "7"),
        ("    4.2.3 End-to-End System Interaction Workflow", "8"),
        ("4.3 Smart Contract Escrow Architecture", "10"),
        ("    4.3.1 Interface Specification (IDonationEscrow.sol)", "10"),
        ("    4.3.2 Escrow Implementation Mechanics (DonationEscrow.sol)", "11"),
        ("    4.3.3 Role-Based Access Control and SafeERC20 Transfers", "12"),
        ("4.4 Artificial Intelligence & Machine Learning Trust Subsystem", "13"),
        ("    4.4.1 Asynchronous FastAPI Service Architecture", "13"),
        ("    4.4.2 spaCy Named Entity Recognition and Gazetteer Verification", "14"),
        ("    4.4.3 Supervised Random Forest Classifier for Risk Profiling", "15"),
        ("    4.4.4 Provincial Schools Gazetteer Dataset", "16"),
        ("4.5 Backend Middleware and RESTful API Orchestration Layer", "17"),
        ("    4.5.1 Mongoose Schemas and Sub-Document Modeling", "17"),
        ("    4.5.2 Express API Endpoints and Proxy Review Pipeline", "18"),
        ("4.6 Client-Side Application Engineering - Donor Portal", "19"),
        ("    4.6.1 Web3 Wallet Integration and Ethers.js v6 Lifecycle", "19"),
        ("    4.6.2 State Management and Theme Persistence", "20"),
        ("    4.6.3 Dynamic Campaign Filtering and Search Engine", "21"),
        ("    4.6.4 Interactive Donation Modal and Over-Allocation Guardrails", "22"),
        ("    4.6.5 Explainable AI Trust Score Badge and Breakdown Tooltip", "23"),
        ("    4.6.6 Transparency Ledger and OCR Receipt Audit Viewer", "24"),
        ("4.7 Administrative Dashboard Engineering", "25"),
        ("    4.7.1 Campaign Creation and Multi-Stage AI Evaluation UI", "25"),
        ("    4.7.2 Real-Time Platform Analytics and Lifecycle Management", "26"),
        ("4.8 Empirical Academic & Architectural Findings", "27"),
        ("    Finding 1: The Trust Gap Is Structural, Not Incidental", "27"),
        ("    Finding 2: NLP Entity Recognition as an Objective Pre-Publication Filter", "28"),
        ("    Finding 3: Incentive Alignment via Non-Custodial Milestone Escrows", "29"),
        ("    Finding 4: Layer 2 Scaling & Gas Optimization for Micro-Donations", "30"),
        ("    Finding 5: State Synchronization and Preference Hydration in SPAs", "31"),
        ("    Finding 6: Cognitive Trust Impact of Explainable AI (XAI)", "32"),
        ("    Finding 7: Dual-Tier Validation Architecture (NER vs ML)", "33"),
        ("    Finding 8: Gas Optimization via Off-Chain Metadata Storage", "34"),
        ("4.9 Selected Source Code Implementations & Step-by-Step Developer Guides", "35"),
        ("    4.9.1 MetaMask Wallet Connection & BrowserProvider Lifecycle", "35"),
        ("    4.9.2 Persistent Dark Mode Synchronization with localStorage", "37"),
        ("    4.9.3 Donation Confirmation and Transaction State Update", "39"),
        ("    4.9.4 Explainable AI Trust Score Badge & Dynamic Breakdown Tooltip", "41"),
        ("    4.9.5 Admin Campaign Creation and AI Dispatch Form", "43"),
        ("    4.9.6 Dynamic Polygonscan Block Explorer Transaction Linking", "45"),
        ("    4.9.7 Smart Contract Donation & SafeERC20 Milestone Release", "47"),
        ("    4.9.8 FastAPI spaCy Named Entity Recognition Analysis Route", "49"),
        ("    4.9.9 Supervised Random Forest Classifier Model Generation", "51"),
        ("    4.9.10 Express AI Review Proxy and Campaign Data Gateway", "53"),
        ("4.10 Comprehensive Verification, Validation, and Test Case Matrix", "55"),
        ("4.11 Master Screenshot Capture Directory & Visual Asset Placement Guide", "62"),
        ("4.12 Critical Evaluation, Security Auditing, Limitations, and Future Roadmap", "64"),
        ("4.13 References", "67")
    ]
    
    for item, page_str in toc_items:
        p_toc = doc.add_paragraph()
        p_toc.paragraph_format.space_before = Pt(1)
        p_toc.paragraph_format.space_after = Pt(1)
        p_toc.paragraph_format.line_spacing = 1.05
        
        r_item = p_toc.add_run(item)
        r_item.font.name = 'Times New Roman'
        r_item.font.size = Pt(11)
        r_item.font.color.rgb = BLACK
        
        # Dots and page
        dots_count = max(2, 75 - len(item))
        dots = " " + "." * dots_count + " "
        r_dots = p_toc.add_run(dots)
        r_dots.font.name = 'Times New Roman'
        r_dots.font.size = Pt(10)
        r_dots.font.color.rgb = BLACK
        
        r_pg = p_toc.add_run(page_str)
        r_pg.bold = True
        r_pg.font.name = 'Times New Roman'
        r_pg.font.size = Pt(11)
        r_pg.font.color.rgb = BLACK

    doc.add_page_break()

    # --- SECTION 4.1 ---
    add_heading_1(doc, "Chapter 04: System Artefact and Technical Implementation")
    
    add_heading_2(doc, "4.1 Executive Summary and System Rationale")
    
    add_heading_3(doc, "4.1.1 Socio-Economic Problem Context")
    add_body_paragraph(
        doc,
        "In developing economies such as Sri Lanka, the rehabilitation and modernization of public school infrastructure "
        "represent critical imperatives for national human capital development. Thousands of regional and rural educational "
        "facilities suffer from acute structural deficiencies, including deteriorated roofing, inadequate sanitary and "
        "clean drinking water installations, severe shortages of classroom furniture, and obsolete or non-existent information "
        "technology laboratories. While global philanthropic entities, non-governmental organizations (NGOs), and individual "
        "diaspora donors express widespread willingness to finance targeted educational rehabilitation initiatives, the "
        "traditional charitable giving ecosystem suffers from systemic inefficiencies, opaque custodial operations, and a "
        "pervasive deficit of institutional trust."
    )
    add_body_paragraph(
        doc,
        "Conventional charitable crowdfunding platforms operate as centralized intermediaries. In these architectures, donor "
        "contributions are aggregated into proprietary custodial bank accounts managed by intermediaries or fundraising entities. "
        "Donors are relegated to passive observers who possess zero real-time visibility into the physical disbursement of their "
        "capital. Periodic narrative reports and promotional photographs—the primary verification instruments employed by "
        "traditional charities—are notoriously vulnerable to retrospective manipulation, selective disclosure, and outright "
        "fabrication. Consequently, donor fatigue, skepticism regarding fund diversion, and high administrative overheads "
        "severely curtail the flow of philanthropic capital to the educational institutions that require it most urgently."
    )

    add_heading_3(doc, "4.1.2 The AuraGive Solution Paradigm")
    add_body_paragraph(
        doc,
        "AuraGive is an advanced, decentralized software artefact engineered to resolve these structural pathologies by synthesizing "
        "two cutting-edge computing paradigms: decentralized smart contract milestone escrow on the Polygon Proof-of-Stake (PoS) "
        "blockchain, and automated Artificial Intelligence (AI) pre-publication verification utilizing Natural Language Processing (NLP) "
        "and supervised machine learning classifiers. By replacing centralized human fund custody with immutable, mathematically "
        "verifiable smart contracts, AuraGive eliminates the single point of failure inherent in conventional philanthropic platforms."
    )
    add_body_paragraph(
        doc,
        "Under the AuraGive architecture, donor funds (denominated in the USD Coin [USDC] stablecoin standard) are never deposited into "
        "an administrative or NGO bank account at the moment of donation. Instead, capital is locked directly inside an audited "
        "Solidity escrow smart contract deployed on the public blockchain. Disbursement occurs in deterministic, phased tranches "
        "linked to predefined, verifiable physical milestones (e.g., procurement of roofing timber, completion of well excavation, "
        "delivery of computing hardware). An NGO cannot access subsequent funding tranches without submitting cryptographic proofs "
        "of completion (anchored to IPFS content identifiers) and receiving cryptographic authorization from platform administrators."
    )
    add_body_paragraph(
        doc,
        "Simultaneously, AuraGive establishes a proactive fraud mitigation barrier prior to campaign publication. Utilizing a dedicated "
        "Python FastAPI microservice integrated with industrial-strength spaCy Named Entity Recognition (NER), incoming campaign "
        "narratives are automatically parsed to extract institutional entities (ORG) and geographical territories (GPE/LOC). These "
        "extracted entities are cross-referenced in real time against an authoritative gazetteer of verified Sri Lankan provincial "
        "schools. The system calculates a deterministic Trust Score accompanied by an explainable, granular breakdown. This pre-publication "
        "filter shifts the burden of fraud detection from vulnerable individual donors to an automated, objective algorithmic pipeline."
    )

    add_heading_3(doc, "4.1.3 Scope of Technical Deliverables")
    add_body_paragraph(
        doc,
        "The AuraGive project artefact represents a fully realized, multi-tier software system comprising five decoupled, "
        "interoperable subsystems engineered and validated across both development and live testnet environments:"
    )
    add_bullet_point(doc, "Smart Contract Escrow Layer: ", "A robust Solidity 0.8.20 decentralized escrow implementation (DonationEscrow.sol) implementing the IDonationEscrow interface, incorporating OpenZeppelin AccessControl and SafeERC20 standards, deployed on the Polygon Amoy Testnet.")
    add_bullet_point(doc, "AI Trust Verification Microservice: ", "An asynchronous Python 3.10+ FastAPI service executing spaCy NER pipelines, gazetteer cross-referencing against schools_dataset.csv, and auxiliary scikit-learn Random Forest predictive classification.")
    add_bullet_point(doc, "Backend API Orchestration Middleware: ", "A Node.js and Express RESTful API server interfacing with a MongoDB document database via Mongoose ODM, orchestrating cross-service HTTP dispatch, campaign lifecycle management, and transaction logging.")
    add_bullet_point(doc, "Donor Web Portal: ", "A high-performance React 18 single-page application built with Vite and Tailwind CSS, featuring Ethers.js v6 Web3 wallet integration, persistent theme state management, dynamic multi-attribute filtering, and interactive escrow donation workflows.")
    add_bullet_point(doc, "Administrative Governance Dashboard: ", "A dedicated React management console providing platform administrators with real-time aggregate financial metrics, campaign lifecycle auditing, multi-attribute form validation, and automated AI review triggers.")

    # --- SECTION 4.2 ---
    add_heading_2(doc, "4.2 System Architecture and High-Level Topology")
    
    add_heading_3(doc, "4.2.1 Multi-Tier Decoupled Architecture")
    add_body_paragraph(
        doc,
        "AuraGive adheres to a microservices-inspired, decoupled architectural topology designed to maximize modularity, fault isolation, "
        "horizontal scalability, and independent deployment lifecycles. Rather than coupling business logic, machine learning inference, "
        "and blockchain state transitions within a monolithic codebase, the system cleanly delineates responsibilities across five distinct tiers:"
    )
    add_bullet_point(doc, "Client Presentation Tier (Donor & Admin): ", "Two decoupled React single-page applications operating on independent local ports (Port 5173 for Donor Portal, Port 5174 for Admin Dashboard) communicating with underlying services exclusively via asynchronous JSON-RPC and RESTful HTTP protocols.")
    add_bullet_point(doc, "Middleware & API Gateway Tier: ", "A Node.js/Express server (Port 3001) acting as the central data orchestrator, enforcing schema validation, managing persistent campaign/user metadata in MongoDB, and proxying analysis requests to the AI engine.")
    add_bullet_point(doc, "AI & Machine Learning Inference Tier: ", "An asynchronous Python FastAPI microservice (Port 5000) providing low-latency entity extraction, dataset cross-referencing, and probabilistic trust score computation.")
    add_bullet_point(doc, "Decentralized Settlement & Escrow Tier: ", "An immutable smart contract network deployed on the Polygon Amoy blockchain, handling cryptographic token custody, milestone verification states, and peer-to-peer ERC-20 transfers.")
    add_bullet_point(doc, "Decentralized Content Addressing Tier: ", "An InterPlanetary File System (IPFS) content storage layer utilizing immutable cryptographic hashes (CIDs) to store campaign multimedia, NGO identity credentials, and milestone expenditure receipts.")

    add_heading_3(doc, "4.2.2 Technology Stack Justification and Analysis")
    add_body_paragraph(
        doc,
        "Each technological component within the AuraGive stack was deliberately selected following rigorous comparative evaluation "
        "against performance, security, developer ergonomics, and domain appropriateness criteria:"
    )
    add_bullet_point(doc, "React 18 & Vite: ", "Chosen for client-side presentation due to Vite's instantaneous Hot Module Replacement (HMR) and optimized Rollup bundling, combined with React's declarative component model and robust ecosystem for Web3 provider integration.")
    add_bullet_point(doc, "Ethers.js (v6): ", "Selected over Web3.js due to its modern asynchronous architecture, complete TypeScript typing, lightweight footprint, and intuitive BrowserProvider abstraction over MetaMask's window.ethereum provider.")
    add_bullet_point(doc, "Tailwind CSS: ", "Employed for rapid, consistent UI component styling, enabling responsive grid layouts, custom glassmorphic styling, and seamless dark-mode utility classes without stylesheet bloat.")
    add_bullet_point(doc, "Node.js & Express: ", "Leveraged for the API orchestration layer due to Node's asynchronous, non-blocking I/O event loop, which excels at handling concurrent HTTP requests and proxying external microservice calls with minimal overhead.")
    add_bullet_point(doc, "MongoDB & Mongoose ODM: ", "Chosen for persistent campaign metadata storage due to its flexible, document-oriented JSON schema structure, which perfectly accommodates nested milestone sub-documents and variable campaign attributes.")
    add_bullet_point(doc, "Python FastAPI: ", "Selected for the AI service over Flask and Django due to its native asynchronous execution (ASGI), automatic OpenAPI documentation, high-performance Starlette foundation, and seamless integration with Pydantic data validation.")
    add_bullet_point(doc, "spaCy (en_core_web_sm): ", "Chosen for Named Entity Recognition over NLTK and transformer models (e.g., BERT) due to its exceptional inference speed, deterministic tokenization, and superior efficiency in extracting ORG and GPE entities within low-resource deployment environments.")
    add_bullet_point(doc, "Solidity 0.8.20 & OpenZeppelin: ", "Solidity 0.8.20 provides built-in arithmetic overflow/underflow protection, while OpenZeppelin v5 contracts provide battle-tested implementations of AccessControl and SafeERC20, mitigating critical vulnerabilities such as reentrancy and unauthorized privilege escalation.")
    add_bullet_point(doc, "Polygon PoS Network (Amoy Testnet): ", "Selected over Ethereum Mainnet and Layer 2 Rollups due to its negligible transaction gas fees ($0.001 - $0.01 per transaction), high throughput (up to 7,000 TPS), 2-second block finality, and robust developer tooling, making micro-donations economically viable.")

    add_heading_3(doc, "4.2.3 End-to-End System Interaction Workflow")
    add_body_paragraph(
        doc,
        "The interaction workflow across the AuraGive platform follows a deterministic eight-stage operational lifecycle, illustrating "
        "the tight coordination between off-chain verification engines and on-chain financial settlement:"
    )
    add_bullet_point(doc, "Stage 1 - Campaign Draft & Metadata Entry: ", "The NGO or school administrator enters campaign parameters (Title, Category, District, Remoteness Index, Goal Amount, Scale Index, Detailed Description, Milestones) into the Admin Portal form.")
    add_bullet_point(doc, "Stage 2 - Asynchronous AI Audit Request: ", "Upon form submission, the Admin frontend dispatches an HTTP POST request containing the campaign description and district to the Node.js middleware, which proxies the payload to the FastAPI /analyse endpoint.")
    add_bullet_point(doc, "Stage 3 - NLP Entity Parsing & Gazetteer Cross-Referencing: ", "The spaCy NLP pipeline processes the text, extracting ORG (institutional names) and GPE/LOC (geographical locations). The algorithm cross-references extracted entities against schools_dataset.csv, evaluating institutional legitimacy and district alignment.")
    add_bullet_point(doc, "Stage 4 - Trust Score & Explainability Synthesis: ", "The AI engine generates a numeric Trust Score (25%, 65%, or 95%), an approval status flag, and a human-readable diagnostic breakdown. This data is returned to the Admin frontend for review.")
    add_bullet_point(doc, "Stage 5 - On-Chain Publication & Database Persistence: ", "The administrator confirms publication. The Node API persists the campaign and AI metadata to MongoDB, while the smart contract's createCampaign() function is invoked to initialize the on-chain escrow instance.")
    add_bullet_point(doc, "Stage 6 - Donor Discovery & Transparent Exploration: ", "Donors access the Donor Portal, browsing verified campaigns dynamically filtered by location, category, or keyword. The AI Trust Score badge and interactive explainability tooltip allow donors to inspect verification credentials.")
    add_bullet_point(doc, "Stage 7 - USDC Escrow Pledge Execution: ", "The donor connects their MetaMask Web3 wallet and initiates a donation. Ethers.js invokes the safeTransferFrom method on the USDC ERC-20 token, transferring funds into the DonationEscrow contract while updating on-chain raised totals.")
    add_bullet_point(doc, "Stage 8 - Milestone Verification & Phased Fund Disbursement: ", "Upon completing a physical project phase, the NGO uploads an expenditure proof document (receipt/invoice) to IPFS and triggers requestMilestoneRelease(). The platform administrator reviews the proof and executes approveMilestone(). The NGO then triggers releaseFunds(), transferring the exact milestone tranche to their wallet.")

    print("Cover, TOC, Section 4.1, and Section 4.2 generated.")
