import pptx
import sys

prs = pptx.Presentation(r'c:\Users\HOME\Desktop\Capstone Projects\Probability & Statistics Capstone\Applied Maths_Capstone (1).pptx')

with open(r'c:\Users\HOME\Desktop\Capstone Projects\Probability & Statistics Capstone\scratch\reference_ppt_structure.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total Slides: {len(prs.slides)}\n\n")

    for idx, slide in enumerate(prs.slides):
        f.write(f"==================== SLIDE {idx+1} ====================\n")
        for s_idx, shape in enumerate(slide.shapes):
            if shape.has_text_frame:
                text = shape.text_frame.text.replace('\n', ' | ')
                if text.strip():
                    f.write(f"[{s_idx}] {text}\n")
        f.write("\n")

print("Successfully written to scratch/reference_ppt_structure.txt")
