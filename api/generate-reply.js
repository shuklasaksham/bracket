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
    console.log("INPUTS:", { clientMessage, realNeed, fitReason });

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
           model: "llama-3.1-8b-instant"
          messages: [
            {
              role: "system",
              content: `
You are drafting a first reply to a potential client on behalf of a freelancer.

Rules:
- You MUST reference at least one specific detail from the client message.
- You MUST mention one concrete first step the freelancer would take.
- You MUST NOT use generic phrases like:
  "happy to discuss", "worked on similar situations",
  "guide things", "reach out".

If information is limited, make reasonable and conservative assumptions.
Only ask ONE clarifying question if making assumptions would sound misleading.

Generic, placeholder replies are considered a failure.
              `.trim()
            },
            {
              role: "user",
              content: `
Client message:
${clientMessage}

What the client actually needs:
${realNeed}

Why the freelancer is a good fit:
${fitReason}

Write the first reply.
              `.trim()
            }
          ]
        })
      }
    );

    const data = await groqRes.json();

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(200).json({
        reply:
          "I want to make sure I understand this properly before responding. Could you share a bit more context?"
      });
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (err) {
    console.error("Groq failure:", err);
    return res.status(200).json({
      reply:
        "I want to make sure I understand this properly before responding. Could you share a bit more context?"
    });
  }
}
