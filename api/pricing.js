export default async function handler(req, res) {
  try {
    const {
      projectType,
      scopeSize,
      timeline,
      revisions,
      clientType,
      experienceLevel,
      riskFlags
    } = req.body || {};

    if (!projectType || !scopeSize || !timeline || !experienceLevel) {
      return res.status(400).json({
        output: "Incomplete pricing information provided."
      });
    }

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
          messages: [
            {
              role: "user",
              content: `
You are assisting a professional freelance designer in India.

Using the parameters below, clearly PRESENT a pricing recommendation.
Do NOT invent logic — only explain based on inputs.

Rules:
- No markdown
- No quotation marks
- Max 3 short sections
- No sales language
- Under 45 words total

Format exactly like this:

Price Range (INR):
₹X – ₹Y

Why:
- reason 1
- reason 2

Assumptions:
- assumption 1

Inputs:
Project type: ${projectType}
Scope size: ${scopeSize}
Timeline: ${timeline}
Revisions: ${revisions || "Not specified"}
Client type: ${clientType || "Not specified"}
Experience level: ${experienceLevel}
Risk flags: ${riskFlags || "None"}
`
            }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await groqRes.json();

    return res.status(200).json({
      output:
        data?.choices?.[0]?.message?.content ||
        "Pricing could not be generated."
    });

  } catch (err) {
    return res.status(500).json({
      output: "Pricing generation failed.",
      error: String(err)
    });
  }
}
