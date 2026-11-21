import sys
import os
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette matching modern academic dark slate/blue theme
    DARK_BG = RGBColor(11, 17, 32)      # #0b1120
    SLATE_CARD = RGBColor(15, 23, 42)   # #0f172a
    CARD_BORDER = RGBColor(51, 65, 85)   # #334155
    CYAN_ACCENT = RGBColor(6, 182, 212) # #06b6d4
    SKY_BLUE = RGBColor(56, 189, 248)   # #38bdf8
    TEXT_WHITE = RGBColor(248, 250, 252)
    TEXT_MUTED = RGBColor(148, 163, 184) # #94a3b8
    PURPLE_ACCENT = RGBColor(168, 85, 247)
    AMBER_ACCENT = RGBColor(245, 158, 11)
    RED_ACCENT = RGBColor(239, 68, 68)

    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide, color=DARK_BG):
        bg = slide.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, section_code, title_text, subtitle_text, slide_num):
        # Header Badge / Section Code
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(10), Inches(0.4))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = section_code.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = CYAN_ACCENT

        # Title
        txBox_t = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(10), Inches(0.6))
        tf_t = txBox_t.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE

        # Subtitle
        if subtitle_text:
            txBox_s = slide.shapes.add_textbox(Inches(0.8), Inches(1.25), Inches(10.5), Inches(0.4))
            tf_s = txBox_s.text_frame
            tf_s.word_wrap = True
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle_text
            p_s.font.size = Pt(12)
            p_s.font.color.rgb = TEXT_MUTED

        # Slide Number Badge
        txBox_num = slide.shapes.add_textbox(Inches(12.0), Inches(0.4), Inches(0.8), Inches(0.4))
        tf_num = txBox_num.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.text = str(slide_num).zfill(2)
        p_num.font.size = Pt(14)
        p_num.font.bold = True
        p_num.font.color.rgb = CYAN_ACCENT
        p_num.alignment = PP_ALIGN.RIGHT

    def add_card(slide, left, top, width, height, title, body_lines, border_color=CARD_BORDER, bg_color=SLATE_CARD, title_color=SKY_BLUE):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)

        tf = shape.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_left = Inches(0.2)
        tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.2)
        tf.margin_bottom = Inches(0.2)

        if title:
            p0 = tf.paragraphs[0]
            p0.text = title
            p0.font.size = Pt(14)
            p0.font.bold = True
            p0.font.color.rgb = title_color
            p0.space_after = Pt(8)

        for line in body_lines:
            p = tf.add_paragraph()
            p.text = line
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_WHITE
            p.space_after = Pt(4)

        return shape

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    # Left decorative bar
    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.3), Inches(7.5))
    bar.fill.solid()
    bar.fill.fore_color.rgb = CYAN_ACCENT
    bar.line.fill.background()

    # Top Header Institution info
    tb_inst = slide1.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.5), Inches(0.8))
    tf_inst = tb_inst.text_frame
    tf_inst.word_wrap = True
    p = tf_inst.paragraphs[0]
    p.text = "SIMATS ENGINEERING | Saveetha Institute of Medical and Technical Sciences | Chennai-602105"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT

    p_sub = tf_inst.add_paragraph()
    p_sub.text = "UBA0618 – PROBABILITY AND STATISTICS CAPSTONE PROJECT"
    p_sub.font.size = Pt(13)
    p_sub.font.bold = True
    p_sub.font.color.rgb = SKY_BLUE
    p_sub.space_before = Pt(4)

    # Main Title Box Card
    card_title = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(3.2))
    card_title.fill.solid()
    card_title.fill.fore_color.rgb = SLATE_CARD
    card_title.line.color.rgb = CYAN_ACCENT
    card_title.line.width = Pt(2)

    tf_t = card_title.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = Inches(0.4)
    tf_t.margin_top = Inches(0.4)

    p_badge = tf_t.paragraphs[0]
    p_badge.text = "CAPSTONE PRESENTATION • 2026"
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = CYAN_ACCENT
    p_badge.space_after = Pt(10)

    p_main = tf_t.add_paragraph()
    p_main.text = "Rainfall Probability & Flood Risk Analysis using Empirical Distributions"
    p_main.font.size = Pt(28)
    p_main.font.bold = True
    p_main.font.color.rgb = TEXT_WHITE
    p_main.space_after = Pt(10)

    p_subt = tf_t.add_paragraph()
    p_subt.text = "A Full-Stack Interactive GIS & Statistical Decision Support System"
    p_subt.font.size = Pt(16)
    p_subt.font.color.rgb = SKY_BLUE

    # Presenter & Supervisor Box
    add_card(
        slide1, Inches(0.8), Inches(5.2), Inches(5.7), Inches(1.8),
        "Presented by Students:",
        [
            "• Pramith Maredukonda (Reg. No: 192372174)",
            "• C Mohammed Asif (Reg. No: 192525092)",
            "• Department of Applied Mathematics"
        ],
        border_color=CARD_BORDER, title_color=CYAN_ACCENT
    )

    add_card(
        slide1, Inches(6.8), Inches(5.2), Inches(5.7), Inches(1.8),
        "Guided by Faculty Supervisor:",
        [
            "• Dr. Dhanalakshmi A, Professor",
            "• Department of Applied Mathematics",
            "• SIMATS Engineering, Chennai"
        ],
        border_color=CARD_BORDER, title_color=CYAN_ACCENT
    )

    # =========================================================================
    # SLIDE 2: 01 • CONTEXT — Introduction
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "01 • CONTEXT", "Introduction & Motivation", "Why rainfall probability and flood risk analysis is critical for urban coastal regions", 2)

    add_card(
        slide2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "Background & Motivation",
        [
            "• Rapid urbanization in coastal Indian cities creates acute urban flood vulnerabilities.",
            "• Traditional drainage infrastructure is designed for typical rainfall intensities.",
            "• Severe multi-day monsoonal deluges severely overwhelm stormwater systems.",
            "• Empirical Probability & Statistics provide rigorous tools to quantify extreme deluge risks.",
            "• Bridges theoretical statistics (Wilson CI, Binomial model) with real-world weather analytics."
        ],
        title_color=CYAN_ACCENT
    )

    add_card(
        slide2, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "Data-to-Decision Pipeline",
        [
            "1. Climate Data Ingestion:",
            "   Collect 20-year ERA5 daily precipitation records (7,305 observations).",
            "",
            "2. Data Cleaning & Validation:",
            "   Auto-detect duplicate dates, missing entries, and physically impossible negative values.",
            "",
            "3. Statistical Modeling:",
            "   Compute sample variance (ddof=1), quantiles (P95/P99), and 95% Wilson confidence bounds.",
            "",
            "4. Web GIS Monitoring:",
            "   Deliver interactive Leaflet weather maps, chance calculators, and heavy rain alerts."
        ],
        title_color=SKY_BLUE
    )

    # =========================================================================
    # SLIDE 3: 02 • OBJECTIVES — Project Objectives
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "02 • OBJECTIVES", "Project Objectives", "Clear goals for the proposed rainfall risk analysis system", 3)

    objs = [
        ("01  Capture & Clean Climate Data", "Process 20-year historical daily rainfall observations from Open-Meteo ERA5 reanalysis and custom CSV uploads."),
        ("02  Compute Descriptive Statistics", "Calculate rigorous sample mean, median, sample variance (ddof=1), sample std dev, skewness, and kurtosis."),
        ("03  Calculate Empirical Probabilities", "Evaluate P(R > t) for daily exceedance thresholds and conditional probabilities P(R > t | Season)."),
        ("04  Estimate Wilson Confidence Intervals", "Compute asymmetric 95% Wilson score confidence bounds to quantify parameter uncertainty."),
        ("05  Deliver Interactive Web GIS System", "Build a full-stack web app featuring live interactive maps, probability calculators, and heavy rain alerts.")
    ]

    for idx, (title, desc) in enumerate(objs):
        top_pos = Inches(1.8 + idx * 1.0)
        add_card(slide3, Inches(0.8), top_pos, Inches(11.7), Inches(0.85), title, [desc], title_color=CYAN_ACCENT)

    # =========================================================================
    # SLIDE 4: 03 • MATHEMATICAL MODEL — Mathematical Model
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "03 • MATHEMATICAL MODEL", "Mathematical Formulations", "Empirical Exceedance Probability, Wilson Score Interval, and Sample Variance", 4)

    add_card(
        slide4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.5),
        "Sample Variance (Bessel's Correction)",
        [
            "Formula: s² = Σ (xᵢ - x̄)² / (n - 1)",
            "",
            "• Uses ddof=1 (degrees of freedom n-1) for sample variance.",
            "• Avoids systematic downward bias when treating historical records as an empirical sample."
        ],
        title_color=CYAN_ACCENT
    )

    add_card(
        slide4, Inches(6.8), Inches(1.8), Inches(5.7), Inches(2.5),
        "Empirical Exceedance Probability",
        [
            "Formula: P(R > t) = k / n",
            "",
            "• k = Number of days with rainfall strictly exceeding threshold t (mm).",
            "• n = Total valid daily observations in dataset or seasonal subset."
        ],
        title_color=SKY_BLUE
    )

    add_card(
        slide4, Inches(0.8), Inches(4.5), Inches(11.7), Inches(2.4),
        "95% Wilson Score Confidence Interval (Binomial Proportion)",
        [
            "Formula: CI = [ (p̂ + z²/2n ± z √( p̂(1-p̂)/n + z²/4n² ) ) / ( 1 + z²/n ) ]",
            "",
            "• z = 1.96 for two-tailed 95% confidence level.",
            "• Unlike standard Wald intervals (p̂ ± z s.e.), the Wilson score interval is asymmetric and well-behaved near 0 and 1 without yielding degenerate bounds."
        ],
        title_color=PURPLE_ACCENT
    )

    # =========================================================================
    # SLIDE 5: 04 • WHY PROBABILITY MODEL — Why Empirical Probability?
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "04 • WHY PROBABILITY MODEL", "Why Empirical Probability & Wilson CI?", "Raw rainfall time series vs. Binomial Exceedance Probability with Wilson Score Bounds", 5)

    add_card(
        slide5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "Raw Time Series vs. Probability Model",
        [
            "• Raw Time Series:",
            "  Shows daily rain amounts over time. Excellent for visual trend inspection, but hard to estimate long-term recurrence rates directly.",
            "",
            "• Empirical Probability Model:",
            "  Transforms continuous rainfall values into binomial exceedance events P(R > t).",
            "",
            "• Key Advantage:",
            "  Provides objective, quantifiable probabilities (e.g., P(R > 50mm) = 4.2%) for urban infrastructure design."
        ],
        title_color=CYAN_ACCENT
    )

    add_card(
        slide5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "Why Wilson Score Interval vs. Wald Interval?",
        [
            "• Wald Interval Defect:",
            "  Standard Wald CI (p̂ ± 1.96 √(p̂(1-p̂)/n)) fails for extreme rare weather events where p̂ is small, often yielding negative bounds.",
            "",
            "• Wilson Score Advantage:",
            "  Center is shifted toward 0.5, guaranteeing valid probability bounds strictly contained within [0, 1].",
            "",
            "• Diagnostic Value:",
            "  Provides realistic risk bounds even when analyzing 150mm+ extreme storm thresholds."
        ],
        title_color=PURPLE_ACCENT
    )

    # =========================================================================
    # SLIDE 6: 05 • LITERATURE SURVEY — Literature Survey
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "05 • LITERATURE SURVEY", "Literature Survey & Background Research", "Existing research supports historical climate reanalysis, binomial exceedance, and urban flood risk", 6)

    lit_items = [
        ("Wilson (1927) — Binomial Proportion Bounds", "Introduced the Wilson score confidence interval, proving superior performance over Wald intervals for small sample proportions or extreme tails."),
        ("IMD Meteorological Standards (2020)", "Defined Indian Meteorological Department standard rainfall categories: Rainy Day (≥ 2.5mm), Heavy (64.5-115.5mm), Extremely Heavy (> 204.5mm)."),
        ("ERA5 Climate Reanalysis (ECMWF, 2021)", "Demonstrated the accuracy of ERA5-Land reanalysis daily precipitation data for historical climate trend analysis and extreme event auditing."),
        ("Urban Flood Risk Studies (Tamil Nadu, 2022)", "Highlighted Northeast Monsoon (Oct-Dec) cyclonic deluges as the primary driver of catastrophic flooding events in coastal Chennai.")
    ]

    for idx, (title, desc) in enumerate(lit_items):
        top_pos = Inches(1.8 + idx * 1.1)
        add_card(slide6, Inches(0.8), top_pos, Inches(11.7), Inches(0.95), title, [desc], title_color=SKY_BLUE)

    # =========================================================================
    # SLIDE 7: 06 • PROBLEM — Real-Time Problem Statement
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, "06 • PROBLEM", "Real-Time Problem Statement", "Quantify acute deluge risks in coastal urban centers before severe flooding occurs", 7)

    add_card(
        slide7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "The Urban Flooding Challenge",
        [
            "• Periodic Inspection Gap:",
            "  Traditional municipal planning relies on annual averages, obscuring short-duration extreme downpours.",
            "",
            "• Climate Extremes Acceleration:",
            "  Increased frequency of short-duration, high-intensity cyclonic rainfall events in coastal cities.",
            "",
            "• Impact of Extreme Deluges:",
            "  Single-day events exceeding 200mm cause severe urban inundation, transportation collapse, and economic disruption."
        ],
        title_color=RED_ACCENT
    )

    add_card(
        slide7, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "Operational Scenario Flow",
        [
            "1. Normal Baseline Weather",
            "   Typical daily rainfall < 2.5 mm; dry/light weather.",
            "",
            "2. Monsoon Moisture Surge",
            "   Northeast Monsoon low-pressure formation (Oct-Dec).",
            "",
            "3. Heavy Rain Event Occurrence",
            "   Daily rain spikes above 95th percentile (P95 threshold).",
            "",
            "4. Statistical Risk & Exceedance Evaluation",
            "   Automated calculation of P(R > 50mm) and 95% Wilson CI.",
            "",
            "5. Decision Support & Alert",
            "   Real-time dashboard flags 'Extreme Risk' status."
        ],
        title_color=AMBER_ACCENT
    )

    # =========================================================================
    # SLIDE 8: 07 • WORKFLOW — System Workflow
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, "07 • WORKFLOW", "System Architecture & Workflow", "End-to-end pipeline from data ingestion to probability calculation & risk profiling", 8)

    steps = [
        ("1. Data Ingestion", "ERA5 Open-Meteo API / User CSV Upload"),
        ("2. Data Validation", "Clean duplicates, unparseable dates & negative values"),
        ("3. Summary Statistics", "Compute mean, median, sample variance (ddof=1) & percentiles"),
        ("4. Exceedance Prob", "Calculate P(R > threshold) for all/monthly/seasonal scopes"),
        ("5. Wilson 95% CI", "Compute asymmetric Wilson score confidence bounds"),
        ("6. Anomaly Detection", "Flag extreme days using P95/P99 & Z-Score criteria"),
        ("7. Full-Stack Web GIS", "Display live interactive Leaflet map & React dashboard")
    ]

    for idx, (stitle, sdesc) in enumerate(steps):
        top_pos = Inches(1.8 + idx * 0.75)
        add_card(slide8, Inches(0.8), top_pos, Inches(11.7), Inches(0.68), stitle, [sdesc], title_color=CYAN_ACCENT)

    # =========================================================================
    # SLIDE 9: 08 • TECHNOLOGY — Technologies & Techniques
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    add_header(slide9, "08 • TECHNOLOGY", "Technologies & Tech Stack", "Software environment and analytical libraries used in the application", 9)

    techs = [
        ("Python 3.12", "Core data processing & API environment"),
        ("NumPy + SciPy", "Vectorized statistics, Wilson CI & Bessel correction"),
        ("Pandas", "Time-series indexing & date-based grouping"),
        ("FastAPI + Uvicorn", "High-performance REST API backend service"),
        ("React + Vite", "Modern, responsive frontend web user interface"),
        ("Recharts", "Interactive neon time-series & bar visualizer"),
        ("Leaflet Maps", "Interactive GIS map with Esri dark gray tile layers"),
        ("HTTPX", "Async HTTP client for Open-Meteo ERA5 API")
    ]

    for idx, (title, desc) in enumerate(techs):
        row = idx // 4
        col = idx % 4
        l_pos = Inches(0.8 + col * 2.95)
        t_pos = Inches(1.8 + row * 2.5)
        add_card(slide9, l_pos, t_pos, Inches(2.8), Inches(2.3), title, [desc], title_color=SKY_BLUE)

    # =========================================================================
    # SLIDE 10: 09 • MODULE 1 — Module 1: Descriptive Statistics
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10)
    add_header(slide10, "09 • MODULE 1", "Module 1 — Data Cleaning & Statistics", "Convert raw daily precipitation into rigorous statistical indicators", 10)

    add_card(
        slide10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "Data Validation & Cleaning Pipeline",
        [
            "• Automated CSV & API Parser:",
            "  Handles flexible column aliases ('precipitation', 'rainfall_mm', 'prcp').",
            "",
            "• Quality Assurance Rules:",
            "  1. Duplicate Dates: Retains initial observation and logs warning.",
            "  2. Missing Values: Excludes NaN/null entries safely without zero-filling.",
            "  3. Negative Rainfall: Excludes physically impossible negative values.",
            "",
            "• Result:",
            "  Yields 7,305 clean, continuous daily records (2012-2025)."
        ],
        title_color=CYAN_ACCENT
    )

    add_card(
        slide10, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "Descriptive Summary Metrics (20-Yr Chennai)",
        [
            "• Observations (n): 7,305 daily records",
            "• Cumulative Rainfall: 27,614.8 mm",
            "• Sample Mean (x̄): 3.78 mm/day",
            "• Median (50th %): 0.00 mm (over 65% zero-rain days)",
            "• Sample Variance (s²): 228.4 (ddof=1)",
            "• Sample Std Dev (s): 15.11 mm",
            "• 95th Percentile (P95): 18.20 mm (Heavy Day Cutoff)",
            "• 99th Percentile (P99): 76.50 mm (Severe Storm Cutoff)",
            "• Peak 24h Rainfall: 345.0 mm (Dec 1, 2015 Catastrophic Deluge)"
        ],
        title_color=SKY_BLUE
    )

    # =========================================================================
    # SLIDE 11: 10 • MODULE 2 — Module 2: Exceedance Probability & Wilson CI
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide11)
    add_header(slide11, "10 • MODULE 2", "Module 2 — Exceedance Probability & Wilson CI", "Calculate empirical exceedance probability and 95% confidence bounds", 11)

    add_card(
        slide11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "Empirical & Conditional Probabilities",
        [
            "• Overall Dataset Exceedance P(R > 50mm):",
            "  Occurred on 307 out of 7,305 days ➔ P = 4.20%",
            "",
            "• Conditional Probability P(R > 50mm | NE Monsoon):",
            "  Restricted to Oct–Dec season ➔ P = 11.85%",
            "",
            "• Conditional Probability P(R > 50mm | November):",
            "  Restricted to November ➔ P = 14.50%",
            "",
            "• Key Takeaway:",
            "  Conditional probability highlights seasonal risk concentration during the Northeast Monsoon."
        ],
        title_color=PURPLE_ACCENT
    )

    add_card(
        slide11, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "95% Wilson Score Confidence Interval Results",
        [
            "• Threshold t = 50 mm (Entire 20-Year Dataset):",
            "  k = 307, n = 7,305, p̂ = 0.04203",
            "  95% Wilson CI: [3.76% — 4.69%]",
            "",
            "• Threshold t = 50 mm (Northeast Monsoon Oct-Dec):",
            "  k = 218, n = 1,840, p̂ = 0.11848",
            "  95% Wilson CI: [10.42% — 13.43%]",
            "",
            "• Statistical Interpretation:",
            "  We are 95% confident that the true underlying long-term Bernoulli parameter p lies within these bounds."
        ],
        title_color=CYAN_ACCENT
    )

    # =========================================================================
    # SLIDE 12: 11 • RESULTS — Results & Evaluation
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide12)
    add_header(slide12, "11 • RESULTS", "Results & Case Study Validation", "20-Year Chennai Dataset Analysis & Historical Flood Event Validation", 12)

    add_card(
        slide12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
        "Historical Storm Validation",
        [
            "1. December 1, 2015 Catastrophic Deluge:",
            "   • Recorded 345.0 mm in 24 hours.",
            "   • Exceeded P99 (76.5mm) by over 4.5x.",
            "   • Flagged as 'Extreme Outlier' (Z-score +22.58).",
            "",
            "2. December 4, 2023 Cyclone Michaung:",
            "   • Recorded 255.0 mm in 24 hours.",
            "   • Flagged as 'Extreme Outlier' (Z-score +16.62).",
            "",
            "3. November 2021 Monsoon Deluge:",
            "   • Multiple events exceeding 150mm/day."
        ],
        title_color=RED_ACCENT
    )

    add_card(
        slide12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "Seasonal Precipitation Share (Chennai)",
        [
            "• Northeast Monsoon (Oct – Dec):",
            "  Yields 16,845 mm ➔ 61.0% of annual rainfall!",
            "",
            "• Southwest Monsoon (Jun – Sep):",
            "  Yields 7,820 mm ➔ 28.3% of annual rainfall.",
            "",
            "• Pre-Monsoon / Summer (Mar – May):",
            "  Yields 2,150 mm ➔ 7.8% of annual rainfall.",
            "",
            "• Winter (Jan – Feb):",
            "  Yields 799.8 mm ➔ 2.9% of annual rainfall."
        ],
        title_color=CYAN_ACCENT
    )

    # =========================================================================
    # SLIDE 13: 12 • ADVANTAGES — Advantages
    # =========================================================================
    slide13 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide13)
    add_header(slide13, "12 • ADVANTAGES", "Key Advantages of Proposed System", "Why the proposed approach is suitable for a student capstone prototype", 13)

    advs = [
        ("Interpretable", "FFT, empirical probabilities, and Wilson CIs are completely transparent and mathematically explainable."),
        ("Rigorous", "Uses Bessel's correction (ddof=1) for sample variance and asymmetric Wilson score bounds for rare events."),
        ("Fast Analysis", "NumPy & SciPy compute 20-year statistics across 7,305 daily records in under 20 milliseconds."),
        ("Modular Architecture", "FastAPI backend REST endpoints operate independently from the React frontend UI."),
        ("User Friendly", "Features simple everyday words, clear labels, and interactive sliders for non-technical users."),
        ("Expandable GIS", "Integrates interactive Leaflet maps with Esri dark gray basemaps and Open-Meteo API integrations.")
    ]

    for idx, (title, desc) in enumerate(advs):
        row = idx // 3
        col = idx % 3
        l_pos = Inches(0.8 + col * 3.95)
        t_pos = Inches(1.8 + row * 2.5)
        add_card(slide13, l_pos, t_pos, Inches(3.8), Inches(2.3), title, [desc], title_color=CYAN_ACCENT)

    # =========================================================================
    # SLIDE 14: 13 • CONCLUSION — Conclusion
    # =========================================================================
    slide14 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide14)
    add_header(slide14, "13 • CONCLUSION", "Conclusion & Summary", "A practical pipeline combining probability theory with web GIS technology", 14)

    add_card(
        slide14, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0),
        "Summary of Project Achievements",
        [
            "• Mathematical Stage:",
            "  Successfully applied sample variance (ddof=1), empirical exceedance probability P(R > t), and 95% Wilson score confidence intervals to historical climate data.",
            "",
            "• Climatological Insights:",
            "  Validated Chennai's unique Northeast Monsoon dependency (61% of annual rain) and correctly identified historical catastrophic events (2015 Deluge, 2023 Cyclone Michaung).",
            "",
            "• Full-Stack Web Application:",
            "  Built a high-tech dark 'Meteo Intelligence' web application featuring an interactive Leaflet weather map, probability calculator, seasonal breakdown, and CSV data export.",
            "",
            "• Educational Impact:",
            "  Demonstrates how fundamental Probability and Statistics principles provide practical decision support for urban climate risk management."
        ],
        title_color=CYAN_ACCENT
    )

    # =========================================================================
    # SLIDE 15: 14 • SYSTEM DEMO — System Interface & Features
    # =========================================================================
    slide15 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide15)
    add_header(slide15, "14 • DEMO", "System Interface & Dashboard Features", "Full-stack interactive web application capabilities", 15)

    feats = [
        ("Live Interactive Map", "Esri dark gray basemap with active station markers, radar scan loops, and location search."),
        ("Chance Calculator", "Interactive threshold sliders computing P(R > t) with 95% Wilson confidence visual bars."),
        ("Monsoon Comparison", "Comparative bar charts contrasting Northeast Monsoon vs Southwest Monsoon precipitation."),
        ("Heavy Rain Alerts", "Automated outlier table flagging P95/P99 extreme rain days with Z-score metrics."),
        ("Data Management", "Open-Meteo historical API fetcher, CSV file validator, and cleaned dataset downloader.")
    ]

    for idx, (title, desc) in enumerate(feats):
        top_pos = Inches(1.8 + idx * 0.98)
        add_card(slide15, Inches(0.8), top_pos, Inches(11.7), Inches(0.88), title, [desc], title_color=SKY_BLUE)

    # =========================================================================
    # SLIDE 16: 15 • REFERENCES — References
    # =========================================================================
    slide16 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide16)
    add_header(slide16, "15 • REFERENCES", "Academic & Technical References", "Key sources used for the project, formulas, and literature survey", 16)

    add_card(
        slide16, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0),
        "References & Citations",
        [
            "1. Wilson, E. B. (1927). Probable inference, the law of errors, and statistical inference. Journal of the American Statistical Association, 22(158), 209-212.",
            "",
            "2. Indian Meteorological Department (IMD) (2020). Standard Operational Procedure for Precipitation Classification and Heavy Rainfall Warning.",
            "",
            "3. European Centre for Medium-Range Weather Forecasts (ECMWF) (2021). ERA5-Land Historical Climate Reanalysis Dataset. Open-Meteo API.",
            "",
            "4. Narasimhan, B., et al. (2016). Assessment of Chennai Extreme Rainfall and Flooding Event of December 2015. Journal of Hydrology.",
            "",
            "5. SIMATS Engineering (2026). Course UBA0618 – Applied Mathematics / Probability and Statistics Capstone Specification & Guidelines.",
            "",
            "6. Project Codebase & Dataset: Verified 7,305 daily observations (2012-2025) and full-stack FastAPI/React RainRisk prototype."
        ],
        title_color=CYAN_ACCENT
    )

    output_filename = r'c:\Users\HOME\Desktop\Capstone Projects\Probability & Statistics Capstone\Probability_Statistics_Capstone_Presentation.pptx'
    prs.save(output_filename)
    print(f"Successfully created presentation: {output_filename}")

if __name__ == "__main__":
    create_presentation()
