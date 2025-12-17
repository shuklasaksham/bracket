export default async function handler(req, res) {
  try {
    const {
      workType,
      deliverables,
      coverage,
      revisions,
      feedback,
      changes,
      dependencies,
      exclusions,
      context
    } = req.body || {};

    if (!workType || !deliverables || deliverables.length === 0) {
      return res.json({
        output: "Please select the scope parameters to generate a clear scope."
      });
    }

    /* ---------- LOGIC LAYER ---------- */

    const coverageMap = {
      "Focused": "a focused set of key flows or pages",
      "Standard": "the core flows and primary states",
      "Broad": "most user-facing surfaces across the product"
    };

    const revisionMap = {
      "Fixed rounds": "a defined number of revision rounds with consolidated feedback",
      "Milestone based": "ongoing feedback aligned to agreed milestones",
      "Final polish only": "light refinement after the main direction is approved"
    };

    const feedbackMap = {
      "Single decision-maker": "feedback is shared through a single point of contact",
      "Consolidated team feedback": "feedback is consolidated internally before being shared",
      "Exploratory": "feedback is shared collaboratively during discussions"
    };

    const changeMap = {
      "Within scope": "adjustments within the agreed scope are included",
      "Discuss collaboratively": "minor additions can be discussed and evaluated collaboratively",
      "Scope expansion": "new requests are treated as a scope expansion"
    };

    const dependencyLines = (dependencies || []).map(d => `• ${d}`);

    const exclusionLines = (exclusions || []).map(e => `• ${e}`);

    /* ---------- PROMPT ---------- */

    const prompt = `
You are a senior designer writing a calm, collaborative project scope.

Tone rules:
- Professional
- Clear
- Non-legal
- Confident, not defensive
- No emojis

Write the scope using the exact sections below.

Project details:
- Type of work: ${workType}
- Design coverage: ${coverageMap[coverage]}
- Deliverables: ${deliverables.join(", ")}
- Revisions: ${revisionMap[revisions]}
- Feedback model: ${feedbackMap[feedback]}
- Change handling: ${changeMap[changes]}
- Timeline dependencies:
${dependencyLines.join("\n")}
- Out of scope:
${exclusionLines.join("\n")}
- Additional context: ${context || "None"}

Required structure:

Scope Overview:
Short paragraph summarizing what will be done.

Included Deliverables:
Bullet list of deliverables.

Revisions & Collaboration:
Explain how revisions and feedback work.

Changes & Additions:
Explain how changes beyond scope are handled.

Timeline & Dependencies:
Explain shared responsibilities and dependencies.

Out of Scope:
Explicit list.

Assumptions:
List calm, reasonable assumptions.

Keep it concise and copy-ready.
`;

    /* ---------- AI CALL ---------- */

    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.key01}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiData = await aiRes.json();
    const output = aiData.choices?.[0]?.message?.content || "Unable to generate scope.";

    res.json({ output });

  } catch (err) {
    res.json({ output: "Something went wrong while generating scope." });
  }
}
