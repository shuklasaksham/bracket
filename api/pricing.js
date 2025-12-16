export default async function handler(req, res) {
  try {
    const {
      projectType,
      size,
      clarity,
      timeline,
      context
    } = req.body || {};

    if (!projectType) {
      return res.status(400).json({ output: "Missing pricing inputs." });
    }

    /* ---------- BASE PRICES (80% INDIA STANDARD) ---------- */
    const basePrice = {
      "UI/UX – Product / SaaS": 12000,
      "UI/UX – Website / Marketing": 10000,
      "Mobile App Design": 14000,
      "Web Design (Visual only)": 9000,
      "Design System / Component Library": 18000,

      "Brand Identity (Logo + basics)": 15000,
      "Brand Refresh / Rebrand": 17000,
      "Brand Guidelines / Visual Language": 20000,

      "Illustration / Artwork": 8000,
      "Social Media Creatives": 7000,
      "Presentation / Pitch Deck": 9000,

      "No-code Website (Webflow / Framer)": 16000,
      "Landing Page (Conversion-focused)": 11000,

      "Design Audit / Review": 10000,
      "Custom / Not sure yet": 12000
    };

    const sizeM = { Small: 1, Medium: 1.7, Large: 2.6 };
    const clarityM = {
      "Very clear": 1,
      "Somewhat clear": 1.2,
      "Exploratory / unclear": 1.45
    };
    const timelineM = {
      Flexible: 1,
      Normal: 1.15,
      Urgent: 1.35
    };

    const base = basePrice[projectType] || 10000;

    const computed =
      base *
      (sizeM[size] || 1) *
      (clarityM[clarity] || 1) *
      (timelineM[timeline] || 1);

    const lower = Math.round(computed / 1000) * 1000;
    const upper = Math.round(lower * 1.3 / 1000) * 1000;

    const rangeText = `Rs. ${lower.toLocaleString("en-IN")} – Rs. ${upper.toLocaleString("en-IN")}`;

    /* ---------- AI NARRATIVE ONLY ---------- */
    const prompt = `
You are a senior freelance designer in India.

Explain why the following price range is reasonable and professional.

Rules:
- Do NOT mention numbers other than the given range
- No bullet points
- No headings
- Calm, confident, consultant tone
- 3–4 short sentences max

Price range:
${rangeText}

Inputs:
Project type: ${projectType}
Project size: ${size}
Client clarity: ${clarity}
Timeline: ${timeline}
Additional context: ${context || "None"}
`;

    const aiRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.key01}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        })
      }
    );

    const aiData = await aiRes.json();
    const narrative =
      aiData?.choices?.[0]?.message?.content ||
      "This range reflects scope, risk, and timeline considerations.";

    return res.status(200).json({
      output: `${rangeText}\n\n${narrative}`
    });

  } catch (err) {
    return res.status(500).json({
      output: "Pricing generation failed.",
      error: String(err)
    });
  }
}
