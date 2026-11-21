"""
Full script to generate the complete 5000+ word Artefact Chapter docx for AuraGive.
Author: Antigravity Assistant for Benul (2641622)
Project: AI-Based Donation Transparency Platform Using Blockchain (AuraGive)
Module: 6CS007 Project and Professionalism
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

BLACK = RGBColor(0, 0, 0)

def set_cell_border(cell, **kwargs):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = tcPr.first_child_found_in("w:tcBorders")
    if tcBorders is None:
        tcBorders = OxmlElement('w:tcBorders')
        tcPr.append(tcBorders)
    
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = 'w:{}'.format(edge)
            element = tcBorders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                tcBorders.append(element)
            for key, val in edge_data.items():
                element.set(qn('w:{}'.format(key)), str(val))

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(20)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Times New Roman'
    run.font.size = Pt(15)
    run.font.color.rgb = BLACK
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Times New Roman'
    run.font.size = Pt(13)
    run.font.color.rgb = BLACK
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.italic = True
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.font.color.rgb = BLACK
    return p

def add_body_paragraph(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.font.color.rgb = BLACK
    return p

def add_bullet_point(doc, bold_prefix, text):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    
    run_bold = p.add_run(bold_prefix)
    run_bold.bold = True
    run_bold.font.name = 'Times New Roman'
    run_bold.font.size = Pt(12)
    run_bold.font.color.rgb = BLACK
    
    run_text = p.add_run(text)
    run_text.font.name = 'Times New Roman'
    run_text.font.size = Pt(12)
    run_text.font.color.rgb = BLACK
    return p

def add_screenshot_placeholder(doc, figure_no, title, target_file, line_range, capture_instructions, placement_guide):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    
    set_cell_border(
        cell,
        top={"sz": 10, "val": "single", "color": "000000", "space": "0"},
        bottom={"sz": 10, "val": "single", "color": "000000", "space": "0"},
        left={"sz": 10, "val": "single", "color": "000000", "space": "0"},
        right={"sz": 10, "val": "single", "color": "000000", "space": "0"}
    )
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    
    r_hdr = p.add_run(f"======================================================================\n[SCREENSHOT PLACEHOLDER {figure_no}: {title.upper()}]\n======================================================================\n")
    r_hdr.bold = True
    r_hdr.font.name = 'Times New Roman'
    r_hdr.font.size = Pt(10.5)
    r_hdr.font.color.rgb = BLACK
    
    items = [
        ("Target Codebase File / Module: ", target_file),
        ("Exact Line Numbers / Code Block: ", line_range),
        ("Capture Instructions: ", capture_instructions),
        ("Document Insertion Location: ", placement_guide),
        ("Figure Caption to Use: ", f"Figure {figure_no}: {title} ({target_file})")
    ]
    
    for label, val in items:
        p_item = cell.add_paragraph()
        p_item.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_item.paragraph_format.space_before = Pt(1)
        p_item.paragraph_format.space_after = Pt(2)
        p_item.paragraph_format.line_spacing = 1.1
        
        r_lbl = p_item.add_run(label)
        r_lbl.bold = True
        r_lbl.font.name = 'Times New Roman'
        r_lbl.font.size = Pt(10)
        r_lbl.font.color.rgb = BLACK
        
        r_val = p_item.add_run(val)
        r_val.font.name = 'Times New Roman'
        r_val.font.size = Pt(10)
        r_val.font.color.rgb = BLACK
        
    p_end = cell.add_paragraph()
    p_end.paragraph_format.space_before = Pt(2)
    p_end.paragraph_format.space_after = Pt(2)
    r_foot = p_end.add_run("======================================================================")
    r_foot.bold = True
    r_foot.font.name = 'Times New Roman'
    r_foot.font.size = Pt(10.5)
    r_foot.font.color.rgb = BLACK

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(2)
    p_after.paragraph_format.space_after = Pt(4)

print("Writing full document generation script...")
