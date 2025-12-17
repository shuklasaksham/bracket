export default async function handler(req, res) {
  try {
    const {
      workType,
      deliverables = [],
      coverage,
      revisions,
      feedback,
      changes,
      dependencies = [],
      exclusions = [],
      context = ""
    } = req.body || {};

    if (!workType || !coverage || !revisions || !feedback || !changes) {
      return res.status(400).json({
        output: "Unable to generate scope. Required inputs are missing."
      });
    }

    /* ---------- HELPERS ---------- */
    const list = (arr) =>
      arr.length
        ? arr.map(i => `• ${i}`).join("\n")
        : "• To be confirmed";

    /* ---------- SCOPE TEXT ---------- */
    const scopeText = `
PROJECT SCOPE

Type of work:
• ${workType}

Deliverables:
${list(deliverables)}

Design coverage:
• ${coverage}

Revision policy:
• ${revisions}

Feedback process:
• ${feedback}

Change management:
• ${changes}

Timeline dependencies:
${list(dependencies)}

Out of scope:
${list(exclusions)}

Assumptions:
• Client provides timely feedback and approvals
• Required assets/content are supplied on time
• Scope changes may impact cost and timeline

${context ? `Additional context:\n• ${context}` : ""}
`.trim();

    return res.status(200).json({
      output: scopeText
    });

  } catch (err) {
    console.error("Scope error:", err);
    return res.status(500).json({
      output: "Unable to generate scope."
    });
  }
}
