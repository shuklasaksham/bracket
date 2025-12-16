export default async function handler(req, res) {
  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        output: "No input provided."
      });
    }

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.key01}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
content: `
You are an experienced freelance designer pricing a project in India.

Rules (must follow):
- Max 3 short sections
- Max 2 bullet points per section
- Do NOT wrap the response in quotation marks
- No introductions or conclusions
- No headings other than those specified
- Keep total length under 45 words

Format exactly like this:

Price Range (INR):
₹X – ₹Y

Key Factors:
- factor 1
- factor 2

Assumptions:
- assumption 1

Project description:
${text}
`
            }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await groqRes.json();

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
