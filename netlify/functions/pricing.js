export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body || "{}");

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ output: "No project description provided." })
      };
    }

    const prompt = `
You are a professional pricing assistant for designers.

Generate:
- A pricing range in INR
- Key assumptions
- Risk flags

Do not hallucinate deliverables.

Project:
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
          temperature: 0.2
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
      "Pricing could not be generated.";

    return {
      statusCode: 200,
      body: JSON.stringify({ output })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        output: "Unexpected error while generating pricing."
      })
    };
  }
}
