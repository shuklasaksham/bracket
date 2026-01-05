export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      clientMessage,
      realNeed,
      fitReason
    } = req.body;

    if (!clientMessage || !realNeed || !fitReason) {
      return res.status(400).json({
        error: "Missing required inputs"
      });
    }

    const systemPrompt = `
You are a calm, experienced freelance professional.

Your task is to draft a FIRST reply to a potential client.
This reply should open a professional conversation — not close a deal.

Rules:
- Sound confident, calm, and grounded
- Focus on understanding the client
- Explain why the freelancer is a good fit WITHOUT listing skills
- Avoid pricing, timelines, guarantees, or commitments
- Avoid buzzwords and sales language
- Avoid apologies or insecurity
- Keep it human, short, and respectful
- 6–8 sentences maximum
- The tone should feel senior and composed
`;

    const userPrompt = `
Client message (raw):
${clientMessage}

What the freelancer believes the client actually needs:
${realNeed}

Why the freelancer believes they are a good fit:
${fitReason}

Write the first reply message.
`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      }
    );

    const data = await aiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No reply generated");
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate reply"
    });
  }
}
