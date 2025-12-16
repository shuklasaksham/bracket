export default async function handler(req, res) {
  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        output: "Missing pricing details."
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
You are an experienced freelance designer working in the Indian market.

Your job is to suggest a realistic project pricing range in INR based on Indian freelance standards — not agency pricing and not international rates.

Guidelines:
- Assume most Indian clients are price-sensitive
- Prefer conservative, defensible pricing over aspirational numbers
- Adjust pricing based on scope size, experience level, client type, and risk
- If something suggests underpricing risk, mention it clearly
- Do NOT exaggerate value or upsell
- Do NOT use markdown, asterisks, or emojis
- Keep the response practical, grounded, and human

Respond using this structure only:

Price Range (INR):
₹X – ₹Y

Why this range:
- 2–3 short reasons tied to scope, experience, and client type

Notes:
- 1–2 practical cautions or assumptions

Project details:
${text}
`
            }
          ],
          temperature: 0.25
        })
      }
    );

    const data = await response.json();

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
