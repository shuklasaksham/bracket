export default async function handler(req, res) {
  try {
    const {
      projectType,
      experience,
      size,
      clarity,
      timeline,
      context
    } = req.body || {};

    if (!projectType || !experience || !size || !clarity || !timeline) {
      return res.status(400).json({
        output: "Missing required pricing inputs."
      });
    }

    /* ---------- BASE PRICE (India-realistic, ~80%) ---------- */
    let base = 0;

    const projectBase = {
      "UI/UX – SaaS / Product": 45000,
      "UI/UX – Enterprise / Internal Tool": 60000,
      "Website Design (Marketing / Corporate)": 30000,
      "Landing Page (Conversion-focused)": 20000,
      "Mobile App Design": 50000,
      "Design System / Component Library": 70000,
      "Brand Identity (Logo + Basics)": 35000,
      "Brand Refresh / Rebrand": 40000,
      "Brand Guidelines / Visual Language": 45000,
      "No-code Website (Webflow / Framer)": 40000,
      "Illustration / Custom Artwork": 25000,
      "Social Media Creatives": 15000,
      "Presentation / Pitch Deck": 20000,
      "Design Audit / UX Review": 18000,
      "Ongoing Design Support (Monthly)": 30000,
      "Custom / Not sure yet": 30000
    };

    base = projectBase[projectType] || 30000;

    /* ---------- EXPERIENCE MULTIPLIER ---------- */
    const expMult = {
      "Early-career (0–2 years)": 0.85,
      "Mid-level (3–5 years)": 1,
      "Senior (6–10 years)": 1.3,
      "Very senior / specialist (10+ years)": 1.6
    };

    base *= expMult[experience] || 1;

    /* ---------- SIZE ---------- */
    const sizeMult = {
      "Small": 0.8,
      "Medium": 1,
      "Large": 1.4
    };

    base *= sizeMult[size] || 1;

    /* ---------- CLARITY ---------- */
    if (clarity === "Exploratory / unclear") base *= 1.2;
    if (clarity === "Somewhat clear") base *= 1.1;

    /* ---------- TIMELINE ---------- */
    if (timeline === "Urgent") base *= 1.25;
    if (timeline === "Flexible") base *= 0.95;

    /* ---------- RANGE ---------- */
    const min = Math.round(base * 0.9 / 1000) * 1000;
    const max = Math.round(base * 1.15 / 1000) * 1000;

    /* ---------- RESPONSE ---------- */
    res.status(200).json({
      output: `A reasonable price range for this project would be **₹${min.toLocaleString()} – ₹${max.toLocaleString()}**.

This range assumes:
• Clear scope agreement before starting
• Limited revisions within the agreed scope
• Professional delivery standards

If the project expands or requirements evolve, pricing should be revisited accordingly.`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      output: "Something went wrong while calculating the price."
    });
  }
}
