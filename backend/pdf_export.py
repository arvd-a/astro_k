"""
Astro K — PDF export via fpdf2.
Generates a tabular summary + North Indian chart diagram into io.BytesIO. Never writes to disk.
"""

from fpdf import FPDF
import io
import math

# ---------------------------------------------------------------------------
# Chart Geometry (mirrored from frontend chartGeometry.js)
# All coordinates are in a 600x600 viewBox, scaled to PDF at render time.
# ---------------------------------------------------------------------------

# 12 house polygons — index 0 = House 1 (top diamond / Lagna)
CHART_POLYGONS_600 = [
    [(300,0), (150,150), (300,300), (450,150)],   # H1  — top diamond
    [(0,0), (150,150), (300,0)],                   # H2  — top-left triangle
    [(0,0), (0,300), (150,150)],                   # H3  — left-top triangle
    [(0,300), (150,450), (300,300), (150,150)],    # H4  — left diamond
    [(0,600), (150,450), (0,300)],                  # H5  — left-bottom triangle
    [(0,600), (300,600), (150,450)],                # H6  — bottom-left triangle
    [(300,600), (450,450), (300,300), (150,450)],  # H7  — bottom diamond
    [(600,600), (450,450), (300,600)],              # H8  — bottom-right triangle
    [(600,600), (600,300), (450,450)],              # H9  — right-bottom triangle
    [(600,300), (450,150), (300,300), (450,450)],  # H10 — right diamond
    [(600,0), (450,150), (600,300)],                # H11 — right-top triangle
    [(600,0), (300,0), (450,150)],                  # H12 — top-right triangle
]

# Visual centers for house number labels
CELL_CENTERS_600 = [
    (300, 150),  # H1
    (150, 50),   # H2
    (50, 150),   # H3
    (150, 300),  # H4
    (50, 450),   # H5
    (150, 550),  # H6
    (300, 450),  # H7
    (450, 550),  # H8
    (550, 450),  # H9
    (450, 300),  # H10
    (550, 150),  # H11
    (450, 50),   # H12
]

# Planet abbreviation map
PLANET_ABBREV = {
    "su": "Su", "mo": "Mo", "ma": "Ma", "me": "Me",
    "ju": "Ju", "ve": "Ve", "sa": "Sa", "ra": "Ra", "ke": "Ke",
}


def _get_planet_positions(cx, cy, num, spacing=8):
    """Spread multiple planets around a center point."""
    if num == 1:
        return [(cx, cy + 6)]
    if num == 2:
        return [(cx - spacing, cy + 6), (cx + spacing, cy + 6)]
    if num == 3:
        return [
            (cx - spacing, cy + 8),
            (cx, cy - 4),
            (cx + spacing, cy + 8),
        ]
    # 4+: small circle
    positions = []
    r = spacing + 2
    for i in range(num):
        angle = (2 * math.pi * i) / num - math.pi / 2
        positions.append((cx + r * math.cos(angle), cy + 6 + r * math.sin(angle)))
    return positions


def _draw_north_indian_chart(pdf, chart_data, origin_x, origin_y, size):
    """
    Draw the North Indian diamond chart diagram on the PDF.

    Args:
        pdf:       FPDF instance
        chart_data: dict matching ChartResponse schema
        origin_x:  X coordinate on the PDF page (mm) for the top-left of the chart
        origin_y:  Y coordinate on the PDF page (mm) for the top-left of the chart
        size:      Width/height of the chart square on the page (mm)
    """
    scale = size / 600.0  # Translate 600px viewBox to PDF mm

    def sx(v):
        return origin_x + v * scale

    def sy(v):
        return origin_y + v * scale

    # --- Outer border ---
    pdf.set_draw_color(80, 80, 80)
    pdf.set_line_width(0.6)
    pdf.rect(origin_x, origin_y, size, size)

    # --- Inner lines: two diagonals ---
    pdf.set_line_width(0.35)
    pdf.set_draw_color(120, 120, 120)
    pdf.line(sx(0), sy(0), sx(600), sy(600))
    pdf.line(sx(600), sy(0), sx(0), sy(600))

    # --- Inner diamond (midpoint connections) ---
    pdf.line(sx(300), sy(0), sx(600), sy(300))
    pdf.line(sx(600), sy(300), sx(300), sy(600))
    pdf.line(sx(300), sy(600), sx(0), sy(300))
    pdf.line(sx(0), sy(300), sx(300), sy(0))

    # --- Build planet-to-house mapping ---
    asc_sign_index = chart_data["ascendant"]["sign_index"]
    house_planets = {i: [] for i in range(12)}

    for planet in chart_data["planets"]:
        # House number = (planet_sign - asc_sign) mod 12
        house_index = (planet["sign_index"] - asc_sign_index) % 12
        label = PLANET_ABBREV.get(planet["id"], planet["id"].upper())
        if planet["is_retrograde"]:
            label += "(R)"
        house_planets[house_index].append(label)

    # --- Draw house numbers and planet glyphs ---
    for i in range(12):
        cx600, cy600 = CELL_CENTERS_600[i]
        cx = sx(cx600)
        cy = sy(cy600)

        # House number (subtle, small)
        pdf.set_font("Helvetica", "", 7)
        pdf.set_text_color(160, 160, 160)
        pdf.set_xy(cx - 4, cy - 14)
        pdf.cell(8, 4, str(i + 1), align="C")

        # Planet glyphs
        planets_in_house = house_planets[i]
        if planets_in_house:
            positions = _get_planet_positions(cx, cy, len(planets_in_house), spacing=7 * scale * 4)
            pdf.set_font("Helvetica", "B", 6.5)
            pdf.set_text_color(40, 40, 40)
            for j, label in enumerate(planets_in_house):
                px, py = positions[j]
                w = pdf.get_string_width(label) + 1
                pdf.set_xy(px - w / 2, py - 2)
                pdf.cell(w, 4, label, align="C")

    # --- "ASC" marker in House 1 center ---
    asc = chart_data["ascendant"]
    pdf.set_font("Helvetica", "I", 6)
    pdf.set_text_color(180, 100, 50)
    asc_cx = sx(CELL_CENTERS_600[0][0])
    asc_cy = sy(CELL_CENTERS_600[0][1])
    pdf.set_xy(asc_cx - 8, asc_cy - 22)
    pdf.cell(16, 4, f"ASC {asc['sign_name'][:3]}", align="C")


def generate_chart_pdf(chart_data: dict) -> bytes:
    """
    Generate a PDF report from chart data.

    Args:
        chart_data: dict matching ChartResponse schema

    Returns:
        PDF file as bytes (ready for HTTP response)
    """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # --- Title ---
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(75, 75, 75)
    pdf.cell(0, 15, "Astro K - Vedic Birth Chart", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)

    # --- Birth Data Header ---
    meta = chart_data["metadata"]
    loc = meta["user_location"]

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, f"Calculation Engine: {meta['calculation_engine']}  |  Ayanamsa: {meta['ayanamsa']}  |  Julian Day: {meta['julian_day']}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 6, f"Location: {loc['lat']:.4f}N, {loc['lon']:.4f}E  |  Timezone: {loc['tz']}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)

    # --- Visual Chart Diagram (North Indian Diamond) ---
    chart_size = 100  # 100mm square
    chart_x = (210 - chart_size) / 2  # Center horizontally on A4 (210mm wide)
    chart_y = pdf.get_y()

    _draw_north_indian_chart(pdf, chart_data, chart_x, chart_y, chart_size)
    pdf.set_y(chart_y + chart_size + 8)

    # --- Ascendant ---
    asc = chart_data["ascendant"]
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 8, f"Ascendant (Lagna): {asc['sign_name']} {asc['sign_degree']:.2f}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # --- Planetary Positions Table ---
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 8, "Planetary Positions", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # Table header
    col_widths = [25, 30, 35, 25, 35, 20, 20]
    headers = ["Planet", "Sign", "Degree", "Abs Deg", "Nakshatra", "Pada", "Retro"]

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(240, 240, 240)
    pdf.set_draw_color(200, 200, 200)

    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 7, header, border=1, fill=True, align="C")
    pdf.ln()

    # Table rows
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(60, 60, 60)

    for planet in chart_data["planets"]:
        cells = [
            planet["id"].upper(),
            planet["sign_name"],
            f"{planet['sign_degree']:.2f}",
            f"{planet['absolute_degree']:.2f}",
            str(planet["nakshatra_index"]),
            str(planet["nakshatra_pada"]),
            "R" if planet["is_retrograde"] else "-",
        ]
        for i, cell in enumerate(cells):
            pdf.cell(col_widths[i], 6, cell, border=1, align="C")
        pdf.ln()

    pdf.ln(5)

    # --- House Cusps Table ---
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 8, "House Cusps (Whole-Sign)", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    house_col_widths = [30, 40]
    house_headers = ["House", "Sign"]

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(240, 240, 240)
    for i, header in enumerate(house_headers):
        pdf.cell(house_col_widths[i], 7, header, border=1, fill=True, align="C")
    pdf.ln()

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(60, 60, 60)
    for house in chart_data["houses"]:
        pdf.cell(house_col_widths[0], 6, str(house["house_number"]), border=1, align="C")
        pdf.cell(house_col_widths[1], 6, house["sign_name"], border=1, align="C")
        pdf.ln()

    pdf.ln(8)

    # --- Footer ---
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 5, "Generated by Astro K | Privacy-first ephemeral chart engine | No data stored", align="C")

    # Output as bytes — never touches disk
    return pdf.output()
