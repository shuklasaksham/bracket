export default async function handler(req, res) {
  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        output: "No project description provided."
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
              content: `Generate a pricing range in INR with assumptions and risks:\n\n${text}`
            }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    const output =
      data?.choices?.[0]?.message?.content ||
      "Pricing could not be generated.";

    res.status(200).json({ output });
  } catch (err) {
    res.status(500).json({
      output: "Server error while generating pricing."
    });
  }
}
