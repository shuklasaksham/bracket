export default async function handler(req, res) {
  return res.status(200).json({
    hasKey: !!process.env.GROQ_API_KEY,
    keyPreview: process.env.GROQ_API_KEY
      ? process.env.GROQ_API_KEY.slice(0, 6)
      : null,
    nodeVersion: process.version
  });
}
