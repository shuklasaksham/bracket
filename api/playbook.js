export default async function handler(req, res) {
  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        output: "No situation provided."
      });
    }

    const response = await fetch(
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
Write a short, firm, and professional client response.

Rules:
- Max 4–5 short lines
- No greetings or sign-offs
- Do NOT wrap the response in quotation marks
- No apologies or emotional language
- Clearly restate the boundary or expectation
- Calm, confident, and respectful tone
- Must be ready to copy-paste and send

Client situation:
${text}
`
            }
          ],
          temperature: 0.3
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      output: data?.choices?.[0]?.message?.content || "Response could not be generated."
    });

  } catch (err) {
    return res.status(500).json({
      output: "Server error while generating response.",
      error: String(err)
    });
  }
}
