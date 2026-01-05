export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "Groq API key not configured"
    });
  }

  try {
    const { clientMessage, realNeed, fitReason } = req.body || {};

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
- Explain why the freelancer is a good fit without listing skills
- Avoid pricing, timelines, guarantees, or commitments
- Avoid buzzwords or sales language
- Avoid apologies or insecurity
- Keep it human and respectful
- 6–8 sentences maximum
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

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.key01}`
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt.trim() },
            { role: "user", content: userPrompt.trim() }
          ]
        })
      }
    );

    const data = await groqRes.json();

    // 🔐 Defensive extraction (Groq-safe)
    let reply = "";

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content === "string") {
      reply = content;
    } else if (Array.isArray(content)) {
      // Groq sometimes returns structured content
      reply = content
        .map(part => (typeof part.text === "string" ? part.text : ""))
        .join("")
        .trim();
    }

    // 🚨 Graceful failure, never throw
    if (!reply || reply.length < 20) {
      return res.status(200).json({
        reply:
          "Thanks for reaching out. From what I understand, you’re looking to get this right early and avoid unnecessary back-and-forth. I’ve worked in similar situations where clarity upfront helped things move smoothly. Happy to walk you through how I’d approach this."
      });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Groq error:", err);
    return res.status(200).json({
      reply:
        "Thanks for sharing the details. From what I understand, getting clarity early seems important here. I’ve worked with similar situations before and can help guide things in the right direction. Happy to discuss this further."
    });
  }
}
