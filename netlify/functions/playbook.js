import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body || "{}");

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ output: "No situation provided." })
      };
    }

    const prompt = `
Write a calm, professional client response.

Tone:
- Firm
- Polite
- Non-defensive

No legal threats.

Situation:
"""${text}"""
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        })
      }
    );

    const raw = await response.text();
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        statusCode: 500,
        body: JSON.stringify({
          output: "AI response could not be parsed."
        })
      };
    }

    const output =
      parsed?.choices?.[0]?.message?.content ??
      "Response could not be generated.";

    return {
      statusCode: 200,
      body: JSON.stringify({ output })
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({
        output: "Unexpected error while generating response."
      })
    };
  }
}
