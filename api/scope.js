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
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "user",
              content: `Rewrite this into a professional scope of work with Included, Excluded, and Change Requests sections:\n\n${text}`
            }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    const output =
      data?.choices?.[0]?.message?.content ||
      "Scope could not be generated.";

    res.status(200).json({ output });
  } catch {
    res.status(500).json({
      output: "Server error while generating scope."
    });
  }
}
