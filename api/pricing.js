export default async function handler(req, res) {
  try {
    const {
      projectType,
      complexity,
      deliverables,
      clarity,
      timeline,
      details
    } = req.body || {};

    // --- Pricing logic (India-realistic floor) ---
    const base = {
      uiux: 9000,
      branding: 11000,
      website: 13000,
      mobile: 16000,
      illustration: 7000,
      custom: 10000
    };

    const complexityM = { simple: 1, moderate: 1.6, complex: 2.4 };
    const deliverableM = { few: 1, some: 1.5, many: 2.2 };
    const clarityM = { clear: 1, partial: 1.2, unclear: 1.4 };
    const timelineM = { flexible: 1, standard: 1.15, urgent: 1.35 };

    const price =
      Math.round(
        (base[projectType] || 9000) *
        complexityM[complexity] *
        deliverableM[deliverables] *
        clarityM[clarity] *
        timelineM[timeline] / 500
      ) * 500;

    // --- AI layer ---
    const prompt = `
You are a senior Indian design consultant.

Generate THREE clearly separated sections:

SECTION 1: SCOPE
- What is INCLUDED
- What is EXCLUDED
- Key assumptions

SECTION 2: RISKS & REVISION RULES
- 2–3 real risks
- Revision expectations

SECTION 3: CLIENT PLAYBOOK
- How the client should work with the designer
- What speeds things up
- What causes delays

Context:
Project type: ${projectType}
Complexity: ${complexity}
Deliverables: ${deliverables}
Client clarity: ${clarity}
Timeline: ${timeline}
Extra context: ${details || "None"}

Tone: calm, firm, experienced. No fluff.
`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.key01}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [{ role: "user", content: prompt }]
        })
      }
    );

    const aiData = await groqRes.json();
    const aiText =
      aiData?.choices?.[0]?.message?.content ||
      "AI interpretation unavailable.";

    const output = `
ESTIMATED PRICE BRACKET
₹${price.toLocaleString("en-IN")}

${aiText}

NOTE:
This is a working bracket, not a final quote.
Final numbers lock only after scope confirmation.
`;

    return res.status(200).json({ output });

  } catch (err) {
    return res.status(500).json({
      output: "Pricing or AI layer failed."
    });
  }
}
