export default async function handler(req, res) {
  try {
    const {
      projectType,
      scopeSize,
      timeline,
      revisions,
      clientType,
      experienceLevel,
      notes
    } = req.body || {};

    if (!projectType || !scopeSize || !timeline || !revisions || !clientType || !experienceLevel) {
      return res.status(400).json({
        output: "Missing required pricing parameters."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: `
You are helping an Indian freelance designer explain project pricing.

Context (already decided internally):
- Project Type: ${projectType}
- Scope Size: ${scopeSize}
- Timeline: ${timeline}
- Revisions: ${revisions}
- Client Type: ${clientType}
- Designer Experience: ${experienceLevel}

Optional extra project details:
${notes || "None provided."}

Your task:
- Explain the pricing clearly and confidently
- Mention why the project falls in this range
- Highlight any risk factors if present
- Keep it practical and grounded in Indian freelance reality
- Do NOT sound like a proposal or sales pitch
- Do NOT use bullet overload

Format:
Price Range (INR):
₹X – ₹Y

Why this range:
(short paragraph)

Notes / Risks:
(1–2 lines max)
`
            }
          ],
          temperature: 0.35
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      output: data?.choices?.[0]?.message?.content || "Pricing could not be generated."
    });

  } catch (err) {
    return res.status(500).json({
      output: "Pricing generation failed.",
      error: String(err)
    });
  }
}
