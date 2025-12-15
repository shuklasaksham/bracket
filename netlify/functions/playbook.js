import fetch from "node-fetch"

export async function handler(event) {
  const { text } = JSON.parse(event.body)

  const prompt = `
Write a professional client response.

Tone:
• Calm
• Firm
• Polite

No legal threats.

Situation:
"""${text}"""
`

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })
  })

  const json = await response.json()

  return {
    statusCode: 200,
    body: JSON.stringify({
      output: json.choices[0].message.content
    })
  }
}
