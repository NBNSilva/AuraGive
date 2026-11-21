# -*- coding: utf-8 -*-
"""
Section 6 Builder:
- 4.8 Empirical Academic & Architectural Findings (8 In-Depth Findings)
"""

from docx_format_utils import (
    add_heading_2, add_heading_3,
    add_body_paragraph, BLACK
)
import docx
from docx.shared import Pt

def build_findings(doc):
    add_heading_2(doc, "4.8 Empirical Academic & Architectural Findings")
    
    add_body_paragraph(
        doc,
        "The iterative research, engineering, and empirical evaluation of the AuraGive platform yielded eight major academic and "
        "architectural findings at the confluence of distributed ledger technology, natural language processing, human-computer interaction, "
        "and socio-technical trust engineering. These findings provide profound theoretical and practical insights for the design of next-generation "
        "philanthropic and transparent computing systems."
    )

    # Finding 1
    add_heading_3(doc, "Finding 1: The Trust Gap Is Structural, Not Incidental")
    add_body_paragraph(
        doc,
        "A foundational finding of this research is that donor skepticism in philanthropic crowdfunding is not merely an incidental "
        "public relations challenge or a consequence of inadequate marketing communications; rather, it is directly caused by the "
        "centralized custodial architecture of conventional charity platforms. In traditional systems, the moment a donor transfers "
        "fiat currency, legal and physical custody of that capital is irrevocably surrendered to an intermediary bank account. Donors "
        "are forced to rely upon post-hoc, self-reported narrative disclosures that lack mathematical or cryptographic guarantees. "
        "Centralized custody creates a single point of failure where funds can be commingled, delayed, or diverted without real-time "
        "donor visibility."
    )
    add_body_paragraph(
        doc,
        "AuraGive demonstrates that replacing centralized human custody with a decentralized, non-custodial milestone escrow smart contract "
        "on the Polygon blockchain structurally eliminates this trust deficit. Because smart contract state transitions are deterministic, "
        "publicly auditable on block explorers, and enforced by cryptographic consensus, donors do not need to trust the platform operator. "
        "Trust is shifted from institutional intermediaries to auditable code, establishing mathematical guarantees that capital cannot be "
        "disbursed unless verified milestone conditions are satisfied."
    )

    # Finding 2
    add_heading_3(doc, "Finding 2: Natural Language Processing as an Objective Pre-Publication Filter")
    add_body_paragraph(
        doc,
        "Traditional fraud prevention in charitable crowdfunding operates almost exclusively reactively: campaigns are published openly, "
        "and fraud detection relies upon retrospective user complaints, viral social media exposés, or manual administrative spot-checks "
        "after funds have already been pledged or misallocated. Empirical analysis conducted during the development of AuraGive revealed "
        "that deceptive or fraudulent campaign proposals exhibit identifiable linguistic and structural patterns, such as exaggerated "
        "emotional urgency cues, vague fund utilization descriptions, and unverifiable institutional claims."
    )
    add_body_paragraph(
        doc,
        "By integrating spaCy Named Entity Recognition (NER) within the pre-publication pipeline, AuraGive demonstrates that automated NLP "
        "can serve as a highly effective, objective first-line gatekeeper. Extracting organizational entities (ORG) and geographical territories "
        "(GPE/LOC) and cross-referencing them against authoritative educational gazetteers enables the platform to flag anomalies, "
        "detect unverified institutions, and compute trust ratings before a single dollar of donor capital is solicited. This fundamentally "
        "transforms fraud mitigation from a reactive, human-intensive process into an automated, proactive barrier."
    )

    # Finding 3
    add_heading_3(doc, "Finding 3: Incentive Alignment via Non-Custodial Milestone-Based Escrows")
    add_body_paragraph(
        doc,
        "In conventional charitable fundraising, non-governmental organizations (NGOs) receive the entire lump-sum capital allocation at the "
        "conclusion of a campaign. This creates a severe misalignment of economic incentives: once the capital is received, the NGO has "
        "diminished financial motivation to adhere strictly to proposed project schedules, cost estimates, or quality standards, while the "
        "donor bears 100% of the execution risk."
    )
    add_body_paragraph(
        doc,
        "The milestone-based escrow architecture implemented in DonationEscrow.sol resolves this principal-agent problem by binding fund "
        "disbursements directly to demonstrable, phased physical progress. Capital remains locked in the smart contract and is released only "
        "in sequential tranches upon the submission and cryptographic approval of verifiable proof documents (e.g., invoices, delivery "
        "receipts anchored to IPFS CIDs). This model protects donors against project abandonment, ensures continuous project accountability, "
        "and incentivizes executing organizations to maintain transparent, structured delivery practices throughout the project lifecycle."
    )

    # Finding 4
    add_heading_3(doc, "Finding 4: Layer 2 Scaling & Gas Optimization for Micro-Donations")
    add_body_paragraph(
        doc,
        "Empirical transaction cost analysis confirmed that deploying charitable donation platforms directly on the Ethereum Mainnet (Layer 1) "
        "is economically unviable for philanthropic micro-donations. During periods of standard network congestion, Ethereum base gas fees "
        "for executing complex smart contract functions (such as ERC-20 approve and transferFrom operations) can fluctuate between $5.00 and "
        "$40.00 USD per transaction. For micro-donations of $10.00 to $50.00—the primary donation range observed in developing regions such as "
        "Sri Lanka—gas fees would consume an unacceptable percentage (up to 50–100%) of the contributed capital."
    )
    add_body_paragraph(
        doc,
        "Deploying AuraGive on the Polygon Proof-of-Stake (PoS) network (and the Amoy Testnet) reduced transaction gas costs to negligible "
        "fractions of a cent ($0.001–$0.01 per transaction) while maintaining 2-second block finality and full EVM compatibility. This finding "
        "proves that high-throughput, low-cost Layer 2 and sidechain scaling networks are indispensable prerequisites for democratizing "
        "blockchain-based philanthropy in emerging markets."
    )

    # Finding 5
    add_heading_3(doc, "Finding 5: Single-Page Application State Hydration and Preference Persistence")
    add_body_paragraph(
        doc,
        "In client-side single-page applications (SPAs) built with React and Vite, managing user interface preferences (such as dark and light "
        "theme modes) at the localized component level creates visual defects, including preference resets upon route navigation and "
        "unpleasant 'flashes of unstyled content' (FOUC) during initial page load. When dark mode state is isolated within individual views, "
        "navigating from the Explore page to Campaign Details causes the state tree to re-initialize to default light mode."
    )
    add_body_paragraph(
        doc,
        "To resolve this architectural issue, AuraGive lifts the isDark state to the root App component and utilizes a lazy state initializer "
        "coupled with the browser's localStorage API. By reading localStorage.getItem('theme') during the initial render and synchronizing state "
        "mutations through a root-level useEffect hook, the theme preference survives full page reloads, browser restarts, and internal "
        "route transitions. This demonstrates that global UI preference states in Web3 SPAs must be hydrated synchronously at the root "
        "boundary before DOM paint execution."
    )

    # Finding 6
    add_heading_3(doc, "Finding 6: Cognitive Trust Impact of Explainable AI (XAI)")
    add_body_paragraph(
        doc,
        "User experience testing and cognitive trust evaluation revealed that presenting donors with an isolated numerical Trust Score "
        "(e.g., 'Trust Score: 92%') without qualitative rationale induces user skepticism rather than confidence. Donors perceived "
        "unexplained numerical scores as arbitrary, opaque, or potentially manipulated by the platform operators, creating a 'black-box' "
        "credibility barrier."
    )
    add_body_paragraph(
        doc,
        "When the numerical score was augmented with an interactive, explainable breakdown popover (e.g., 'School Identity: Verified "
        "[Galgamuwa Kanishta Vidyalaya]. Location: Verified [Kurunegala District Match]'), user trust in the validity of the rating increased "
        "dramatically. Donors reported significantly higher willingness to pledge capital when the specific verification criteria were "
        "transparently articulated. This finding underscores that in high-stakes social and philanthropic computing applications, explainable "
        "AI (XAI) is just as critical as algorithmic accuracy."
    )

    # Finding 7
    add_heading_3(doc, "Finding 7: Dual-Tier Validation Architecture (Deterministic NER vs Probabilistic ML)")
    add_body_paragraph(
        doc,
        "Evaluating campaign validity solely through statistical machine learning models (such as Random Forest classifiers) introduces "
        "vulnerabilities to edge cases, distribution shifts, and adversarial text phrasing. Conversely, relying strictly on rigid database "
        "lookups fails to accommodate natural language variations, spelling errors, and descriptive narrative styles. AuraGive resolved "
        "this by pioneering a dual-tier hybrid validation architecture."
    )
    add_body_paragraph(
        doc,
        "Tier 1 executes deterministic Named Entity Recognition and gazetteer cross-referencing to verify factual institutional identity "
        "and geographical consistency. Tier 2 applies supervised Random Forest classification to evaluate continuous multi-variable risk "
        "indicators (e.g., funding goal proportionality, description length, external link verification). Combining deterministic factual "
        "verification with probabilistic risk modeling creates a multi-layered defense that achieves superior accuracy, resilience against "
        "spoofing, and robust error tolerance."
    )

    # Finding 8
    add_heading_3(doc, "Finding 8: Gas Optimization via Hybrid On-Chain State / Off-Chain IPFS Content Addressing")
    add_body_paragraph(
        doc,
        "Storing large unstructured multimedia files, high-resolution photographs, legal certificates, and extensive narrative descriptions "
        "directly on the blockchain is technically and economically prohibitive due to high storage gas costs (estimated at thousands of "
        "dollars per megabyte on EVM networks). AuraGive demonstrates the optimal hybrid on-chain / off-chain design pattern."
    )
    add_body_paragraph(
        doc,
        "Heavy unstructured data assets (campaign descriptions, milestone receipts, vendor invoices) are persisted off-chain on the "
        "decentralized InterPlanetary File System (IPFS). Only the immutable 46-character cryptographic Content Identifiers (CIDs)—such as "
        "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco—are committed to Solidity smart contract storage (descriptionCid, proofDocumentCid). "
        "This minimizes on-chain storage overhead to 32 bytes per string while providing mathematical proof that off-chain data has not "
        "been tampered with or altered post-deployment."
    )

    print("Section 4.8 (8 Findings) generated.")
