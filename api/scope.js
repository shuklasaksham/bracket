export default async function handler(req, res) {
  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        output: "No scope description provided."
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
Rewrite the project description below into a clear, professional scope of work under 50 words.

Rules:
- Use clear section headings
- Include only what is explicitly mentioned
- Do not assume development or additional services
- Do NOT use Markdown, asterisks, or special formatting
- Be precise and unambiguous
- Do NOT wrap the response in quotation marks
- Keep language client-friendly but firm

Structure the output exactly as:
1. Project Overview
2. Included
3. Excluded
4. Revisions & Change Requests

Project description:
${text}
`
            }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      output: data?.choices?.[0]?.message?.content || "Scope could not be generated."
    });

  } catch (err) {
    return res.status(500).json({
      output: "Server error while generating scope.",
      error: String(err)
    });
  }
}
