export default async function handler(req, res) {
  try {
    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ output: "No input provided" });
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
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: text }],
          temperature: 0.2
        })
      }
    );

    const raw = await groqRes.text();
    const parsed = JSON.parse(raw);

    return res.status(200).json({
      output: parsed.choices[0].message.content
    });
  } catch (err) {
    return res.status(500).json({
      output: "Pricing generation failed",
      error: String(err)
    });
  }
}
