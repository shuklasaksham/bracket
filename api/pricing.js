export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: "No input provided" });
    }

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.2
        })
      }
    );

    const rawText = await groqRes.text();

    return res.status(200).json({
      groqStatus: groqRes.status,
      groqRawResponse: rawText
    });

  } catch (err) {
    return res.status(500).json({
      error: "Function crashed",
      details: String(err)
    });
  }
}
