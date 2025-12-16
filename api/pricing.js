export default async function handler(req, res) {
  try {
    const { projectType, scale, timeline, details } = req.body || {};

    if (!projectType || !scale || !timeline) {
      return res.status(400).json({
        output: "Missing project information."
      });
    }

    // Base pricing (₹) – realistic Indian freelance / studio range
    const basePricing = {
      uiux: 8000,
      branding: 10000,
      website: 12000,
      mobile: 15000,
      illustration: 6000,
      custom: 9000
    };

    const scaleMultiplier = {
      small: 1,
      medium: 1.8,
      large: 2.8
    };

    const timelineMultiplier = {
      relaxed: 1,
      normal: 1.15,
      urgent: 1.35
    };

    const base = basePricing[projectType] || 8000;
    const price =
      Math.round(
        base *
        scaleMultiplier[scale] *
        timelineMultiplier[timeline] / 500
      ) * 500;

    const typeLabel = {
      uiux: "UI/UX design",
      branding: "branding work",
      website: "website design",
      mobile: "mobile app design",
      illustration: "illustration work",
      custom: "custom project"
    }[projectType];

    let response = `Here’s a realistic bracket for this ${typeLabel} project.\n\n`;

    response += `• Scope: ${scale} complexity\n`;
    response += `• Timeline: ${timeline}\n\n`;

    response += `Based on similar work done in the Indian market, a fair estimate would land around:\n\n`;
    response += `₹${price.toLocaleString("en-IN")}\n\n`;

    response += `This accounts for actual working hours, revisions, and delivery — not inflated agency pricing, and not unsustainable underpricing either.\n\n`;

    if (details && details.trim().length > 0) {
      response += `You mentioned additional context:\n"${details.trim()}"\n\n`;
      response += `That context may slightly shift scope or revisions once discussed properly, but this bracket still holds as a sensible starting point.\n\n`;
    }

    response += `Next step would normally be clarifying assumptions, revision limits, and handoff format before locking this into a formal quote.`;

    return res.status(200).json({ output: response });

  } catch (err) {
    return res.status(500).json({
      output: "Internal error while calculating pricing."
    });
  }
}
