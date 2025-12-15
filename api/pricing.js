export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ output: "Method not allowed" });
    }

    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ output: "No input text received" });
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
          model: "llama3-70b-8192",
          messages: [
            {
              role: "user",
              content: `Generate a pricing range in INR with assumptions:\n\n${text}`
            }
          ],
          temperature: 0.2
        })
      }
    );

    const rawText = await groqRes.text();

    // 👇 TEMP DEBUG RESPONSE
    return res.status(200).json({
      debug: true,
      groqStatus: groqRes.status,
      groqResponse: rawText
    });

  } catch (err) {
    return res.status(500).json({
      output: "Server crashed",
      error: String(err)
    });
  }
}
