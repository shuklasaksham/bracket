export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.groq_key) {
    return res.status(500).json({
      reply: "AI is not configured yet."
    });
  }

  try {
    const { clientMessage, realNeed, fitReason } = req.body || {};

    if (!clientMessage || !realNeed || !fitReason) {
      return res.status(200).json({
        reply: "Please add a bit more context so I can help properly."
      });
    }

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.groq_key}`
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
                "You are a calm, senior freelance professional drafting a first reply to a client. Avoid pricing, timelines, guarantees, and sales language."
            },
            {
              role: "user",
              content: `
Client message:
${clientMessage}

Client's real need:
${realNeed}

Why the freelancer fits:
${fitReason}

Write a calm first reply (6–8 sentences).
              `.trim()
            }
          ]
        })
      }
    );

    const data = await groqRes.json();

    let reply = "";
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content === "string") {
      reply = content;
    } else if (Array.isArray(content)) {
      reply = content.map(c => c.text || "").join("");
    }

    // NEVER throw. Ever.
    if (!reply || reply.trim().length < 20) {
      reply =
        "Thanks for reaching out. From what I understand, getting clarity early seems important here. I’ve worked with similar situations before and can help guide things in the right direction. Happy to discuss this further.";
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (err) {
    console.error("Groq failure:", err);
    return res.status(200).json({
      reply:
        "Thanks for sharing the details. From what I understand, clarity upfront will be helpful here. I’ve worked on similar situations before and would be happy to walk you through my approach."
    });
  }
}
