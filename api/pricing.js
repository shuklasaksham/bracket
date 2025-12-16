export default async function handler(req, res) {
  try {
    const { projectType, scale, timeline, details } = req.body || {};

    if (!projectType) {
      return res.status(400).json({ output: "Missing project data." });
    }

    // Indian market base floors (₹)
    const base = {
      uiux: 8000,
      branding: 10000,
      website: 12000,
      mobile: 15000,
      illustration: 6000,
      custom: 9000
    };

    const scaleM = { small: 1, medium: 1.8, large: 2.8 };
    const timeM = { relaxed: 1, normal: 1.15, urgent: 1.35 };

    const price =
      Math.round(
        (base[projectType] || 8000) *
        (scaleM[scale] || 1) *
        (timeM[timeline] || 1) / 500
      ) * 500;

    // ---- AI INTERPRETATION LAYER ----
    const aiPrompt = `
You are a senior design consultant in India.

User project:
Type: ${projectType}
Scale: ${scale}
Timeline: ${timeline}
Extra context: ${details || "None"}

Respond with:
1. A calm, human explanation of scope
2. Clear assumptions
3. 2–3 risk flags
4. Revision expectations
Tone: professional, grounded, not salesy.
`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.key01}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [{ role: "user", content: aiPrompt }]
        })
      }
    );

    const groqData = await groqRes.json();
    const aiText =
      groqData?.choices?.[0]?.message?.content ||
      "Scope discussion required.";

    const finalOutput = `
Estimated Bracket: ₹${price.toLocaleString("en-IN")}

${aiText}

This number is a working bracket, not a final quote.
Final pricing depends on locked scope and confirmed assumptions.
`;

    return res.status(200).json({ output: finalOutput });

  } catch (e) {
    return res.status(500).json({
      output: "AI or pricing layer failed."
    });
  }
}
