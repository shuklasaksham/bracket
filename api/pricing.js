export default async function handler(req, res) {
  try {
    const {
      projectType,
      scopeSize,
      timeline,
      revisions,
      clientType,
      experience,
      context
    } = req.body || {};

    // Basic validation
    if (!projectType || !scopeSize || !timeline || !revisions || !clientType || !experience) {
      return res.status(400).json({
        output: "Missing required pricing parameters."
      });
    }

    /**
     * 🇮🇳 INDIAN BASE PRICING (MONTHLY FREELANCE REALITY)
     * These are intentionally conservative.
     */
    const BASE_PRICES = {
      "Brand identity": 20000,
      "UI/UX design": 18000,
      "Website design": 15000,
      "App design": 22000,
      "Social media creatives": 8000,
      "Pitch deck": 12000,
      "Illustration": 10000
    };

    const SCOPE_MULTIPLIER = {
      "Small (few deliverables)": 1,
      "Medium (multiple deliverables)": 1.5,
      "Large (complex / many deliverables)": 2.2
    };

    const TIMELINE_MULTIPLIER = {
      "Flexible": 1,
      "Moderate": 1.2,
      "Urgent": 1.5
    };

    const EXPERIENCE_MULTIPLIER = {
      "Early (0–2 years)": 0.9,
      "Mid (2–5 years)": 1.1,
      "Senior (5+ years)": 1.35
    };

    const base = BASE_PRICES[projectType] || 15000;

    let estimated =
      base *
      SCOPE_MULTIPLIER[scopeSize] *
      TIMELINE_MULTIPLIER[timeline] *
      EXPERIENCE_MULTIPLIER[experience];

    // Revision pressure adjustment
    if (revisions === "Unlimited / unclear") {
      estimated *= 1.25;
    }

    // Client risk adjustment
    if (clientType === "Agency / intermediary") {
      estimated *= 1.15;
    }

    const minPrice = Math.round(estimated * 0.85);
    const maxPrice = Math.round(estimated * 1.15);

    // AI for explanation only
    const explanationPrompt = `
You are a senior Indian freelance designer.

Explain the following pricing clearly and confidently:
- Price range: ₹${minPrice} – ₹${maxPrice}
- Project type: ${projectType}
- Scope: ${scopeSize}
- Timeline: ${timeline}
- Revisions: ${revisions}
- Client type: ${clientType}
- Experience: ${experience}
${context ? `Additional context: ${context}` : ""}

Rules:
- Keep it under 90 words
- No markdown
- Sound experienced, not apologetic
- Mention 1 risk if applicable
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

    return res.status(200).json({
      output: `Price range (INR): ₹${minPrice} – ₹${maxPrice}\n\n${aiData?.choices?.[0]?.message?.content || ""}`
    });

  } catch (err) {
    return res.status(500).json({
      output: "Pricing generation failed.",
      error: String(err)
    });
  }
}
