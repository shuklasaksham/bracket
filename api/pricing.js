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
You are helping an experienced freelance designer price a project in India.
Based on the project description:
- Give a realistic pricing RANGE in INR
- Briefly explain what factors influenced this range
- Clearly mention key assumptions or risks
- Keep the tone confident and professional
- Avoid package tiers or sales language
- Keep the response concise and practical under 50 words or less

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
