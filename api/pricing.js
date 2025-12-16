export default async function handler(req, res) {
  try {
    const {
      projectType,
      scopeSize,
      timeline,
      revisions,
      clientType,
      experienceLevel,
      additionalContext
    } = req.body || {};

    if (
      !projectType ||
      !scopeSize ||
      !timeline ||
      !revisions ||
      !clientType ||
      !experienceLevel
    ) {
      return res.status(400).json({
        output: "Missing required pricing parameters."
      });
    }

    /**
     * -----------------------------
     * BASE PRICE (Indian standards)
     * -----------------------------
     */

    let basePrice = 0;

    // Project type base
    const projectBaseMap = {
      "Brand identity": 20000,
      "Logo design": 10000,
      "UI/UX design": 30000,
      "Website design": 25000,
      "App design": 35000,
      "Social media creatives": 8000,
      "Pitch deck / presentation": 12000
    };

    basePrice += projectBaseMap[projectType] || 20000;

    // Scope size multiplier
    const scopeMultiplier = {
      "Small (few deliverables)": 1,
      "Medium (multiple deliverables)": 1.4,
      "Large (complex / many deliverables)": 1.8
    };

    basePrice *= scopeMultiplier[scopeSize] || 1;

    // Timeline multiplier
    const timelineMultiplier = {
      "Flexible": 1,
      "Moderate": 1.15,
      "Urgent": 1.3
    };

    basePrice *= timelineMultiplier[timeline] || 1;

    // Revisions multiplier
    const revisionMultiplier = {
      "1–2 rounds": 1,
      "3–4 rounds": 1.15,
      "Unlimited / unclear": 1.3
    };

    basePrice *= revisionMultiplier[revisions] || 1;

    // Client type adjustment
    const clientAdjustment = {
      "Startup / small business": 1,
      "Agency": 1.2,
      "Enterprise": 1.4,
      "Individual / personal": 0.9
    };

    basePrice *= clientAdjustment[clientType] || 1;

    // Experience adjustment
    const experienceAdjustment = {
      "Early (0–2 years)": 0.85,
      "Mid (3–5 years)": 1,
      "Senior (6+ years)": 1.25
    };

    basePrice *= experienceAdjustment[experienceLevel] || 1;

    /**
     * -----------------------------
     * FINAL RANGE
     * -----------------------------
     */

    const minPrice = Math.round(basePrice * 0.9);
    const maxPrice = Math.round(basePrice * 1.15);

    /**
     * -----------------------------
     * AI EXPLANATION (NOT DECISION)
     * -----------------------------
     */

    const explanationPrompt = `
You are assisting an Indian freelance designer.

Pricing calculation (already done):
- Project type: ${projectType}
- Scope size: ${scopeSize}
- Timeline: ${timeline}
- Revisions: ${revisions}
- Client type: ${clientType}
- Experience: ${experienceLevel}
- Estimated price range: ₹${minPrice} – ₹${maxPrice}

Additional context from designer:
${additionalContext || "None"}

Write a concise explanation covering:
- Why this range is reasonable in the Indian freelance market
- Key risk factors (scope creep, urgency, client behavior)
- One short negotiation tip

Rules:
- No markdown
- No bullet overload
- Calm, confident, practical tone
- 6–8 short lines max
`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: explanationPrompt }],
          temperature: 0.4
        })
      }
    );

    const aiData = await groqRes.json();
    const explanation =
      aiData?.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      output: `Estimated price range: ₹${minPrice} – ₹${maxPrice}\n\n${explanation}`
    });

  } catch (err) {
    return res.status(500).json({
      output: "Pricing generation failed.",
      error: String(err)
    });
  }
}
