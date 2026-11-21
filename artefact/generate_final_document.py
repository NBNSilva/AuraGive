# -*- coding: utf-8 -*-
"""
Master Builder for AuraGive Artefact Chapter.
Executes all section builders, compiles the full document, and verifies word count.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from docx_format_utils import BLACK
from make_section_1_2 import build_cover_and_intro
from make_section_3_5 import build_subsystems
from make_section_6_findings import build_findings
from make_section_7_code_guides import build_code_guides
from make_section_8_testing_eval import build_testing_and_eval

def generate_document():
    doc = docx.Document()

    # Set page layout - Standard Letter with 1-inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Set base style defaults
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = BLACK
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    print("Building Section 1 & 2 (Cover, Declaration, TOC, 4.1, 4.2)...")
    build_cover_and_intro(doc)

    print("Building Section 3 to 5 (4.3 Smart Contracts, 4.4 AI, 4.5 Backend, 4.6 Donor UI, 4.7 Admin UI)...")
    build_subsystems(doc)

    print("Building Section 6 (4.8 Academic & Architectural Findings)...")
    build_findings(doc)

    print("Building Section 7 (4.9 Code Guides & Screenshot Placeholders)...")
    build_code_guides(doc)

    print("Building Section 8 (4.10 Test Cases, 4.11 Catalog, 4.12 Eval, 4.13 References)...")
    build_testing_and_eval(doc)

    # Output paths
    output_path1 = "Artefact_Chapter_Benul_Advanced.docx"
    output_path2 = os.path.join("artefact", "Artefact_Chapter_Benul_Advanced.docx")

    doc.save(output_path1)
    os.makedirs("artefact", exist_ok=True)
    doc.save(output_path2)

    print(f"\nDocument saved successfully to:")
    print(f"1. {os.path.abspath(output_path1)}")
    print(f"2. {os.path.abspath(output_path2)}")

    # Calculate exact word count
    total_words = 0
    for p in doc.paragraphs:
        if p.text.strip():
            total_words += len(p.text.split())
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                if cell.text.strip():
                    total_words += len(cell.text.split())

    print(f"\n=== DOCUMENT AUDIT ===")
    print(f"Total Paragraphs: {len(doc.paragraphs)}")
    print(f"Total Tables: {len(doc.tables)}")
    print(f"Total Word Count: {total_words} words")
    print(f"Target Word Count: 5000+ words")
    
    return total_words

if __name__ == '__main__':
    generate_document()
