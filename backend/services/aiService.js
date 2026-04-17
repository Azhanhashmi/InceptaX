const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * AI evaluation - called MANUALLY by admin, not on submission
 */
const evaluateProject = async (repoData, userDescription) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-your")) {
    console.warn("⚠️  Using mock AI evaluation");
    return getMockEvaluation();
  }

  const prompt = `
You are an expert software engineer evaluating a hackathon project submission.

PROJECT: ${repoData?.name || "Unknown"}
LANGUAGE: ${repoData?.language || "Unknown"}
DESCRIPTION: ${userDescription}
README: ${repoData?.readme?.slice(0, 2000) || "Not available"}
FILE STRUCTURE:
${repoData?.fileTree?.slice(0, 20).join("\n") || "Not available"}

Evaluate on:
1. Code structure & organization
2. Complexity & ambition  
3. Real-world usefulness
4. UI/UX quality (from description/README)
5. Documentation quality

Respond ONLY with valid JSON:
{
  "score": <0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a hackathon judge. Respond only with valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const raw = res.choices[0].message.content.trim();
    return parseResponse(raw);
  } catch (err) {
    console.error("OpenAI error:", err.message);
    return getMockEvaluation();
  }
};

const parseResponse = (raw) => {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    return {
      score: Math.min(100, Math.max(0, parseInt(parsed.score) || 50)),
      strengths: parsed.strengths?.slice(0, 3) || [],
      weaknesses: parsed.weaknesses?.slice(0, 3) || [],
      suggestions: parsed.suggestions?.slice(0, 3) || [],
      rawText: raw,
    };
  } catch {
    return getMockEvaluation();
  }
};

const getMockEvaluation = () => ({
  score: Math.floor(Math.random() * 25) + 60,
  strengths: [
    "Clear project structure with well-organized directories",
    "Good use of modern technologies and frameworks",
    "Meaningful README with setup instructions",
  ],
  weaknesses: [
    "Could benefit from more inline code comments",
    "No automated tests found",
    "Error handling could be more comprehensive",
  ],
  suggestions: [
    "Add unit and integration tests",
    "Document all environment variables in README",
    "Consider adding a contributing guide",
  ],
  rawText: "Mock evaluation — configure OPENAI_API_KEY for real analysis",
});

module.exports = { evaluateProject };
