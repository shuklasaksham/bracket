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
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: `Give a pricing range in INR with assumptions and risks:\n\n${text}`
            }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await groqRes.json();

    return res.status(200).json({
      output: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({
      output: "Pricing generation failed",
      error: String(err)
    });
  }
}
