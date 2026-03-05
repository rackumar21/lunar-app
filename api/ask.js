import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ error: "No question provided" });
  }

  const systemPrompt = buildSystemPrompt(context);

  try {
    // Run both calls in parallel: main answer + memory extraction
    const [answerResponse, memoryResponse] = await Promise.all([
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: question }],
      }),
      client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        system: `Extract personal health facts from this message that are worth remembering long-term. Return ONLY a JSON array of short strings, e.g. ["Has PCOD", "Takes metformin 500mg", "Vegetarian"]. Return [] if nothing personal and health-related is mentioned. Focus on: medical conditions, diagnoses, medications, supplements, allergies, dietary restrictions, lifestyle factors.`,
        messages: [{ role: "user", content: question }],
      }),
    ]);

    const answer = answerResponse.content[0]?.text || "I couldn't generate a response. Please try again.";

    let newFacts = [];
    try {
      const raw = memoryResponse.content[0]?.text || "[]";
      // Handle cases where model wraps JSON in markdown code blocks
      const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      newFacts = JSON.parse(cleaned);
      if (!Array.isArray(newFacts)) newFacts = [];
    } catch {
      newFacts = [];
    }

    return res.status(200).json({ answer, newFacts });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return res.status(500).json({ error: "Failed to get a response. Please try again." });
  }
}

function buildSystemPrompt(context) {
  const {
    userName,
    today,
    cycleDay,
    predictedCycleLength,
    daysUntilNextPeriod,
    nextPeriodDate,
    isOnPeriod,
    recentPeriods,
    recentLogs,
    hormoneReports,
    memories,
  } = context || {};

  return `You are Lunar, a personal health companion for ${userName || "this user"}. You have access to their real cycle and health data. Answer questions clearly, warmly, and concisely. Use plain English. Never be alarmist — you are supportive, not diagnostic. Always suggest consulting a doctor for medical decisions.

TODAY'S DATE: ${today}

WHAT I KNOW ABOUT YOU (remembered from past conversations):
${memories?.length > 0
  ? memories.map(m => `- ${m}`).join("\n")
  : "- Nothing specific yet — mention your conditions, medications, or preferences and I'll remember them"}

CURRENT CYCLE:
- Cycle day: ${cycleDay ?? "Unknown — no period logged yet"}
- Predicted cycle length: ${predictedCycleLength} days
- Currently on period: ${isOnPeriod ? "Yes" : "No"}
- Days until next period: ${daysUntilNextPeriod ?? "Unknown"}
- Next period predicted: ${nextPeriodDate ?? "Unknown"}

PERIOD HISTORY (most recent first):
${recentPeriods?.length > 0
  ? recentPeriods.map(p => `- ${p.label} — cycle ${p.cycleLength}d, period ${p.periodLength ?? "?"}d`).join("\n")
  : "- No period history logged yet"}

RECENT DAILY LOGS (last 30 days):
${recentLogs?.length > 0
  ? recentLogs.map(l => {
      const parts = [];
      if (l.mood) parts.push(`mood: ${l.mood}`);
      if (l.pain > 0) parts.push(`pain: ${l.pain}/4`);
      if (l.flow) parts.push(`flow: ${l.flow}`);
      if (l.symptoms?.length > 0) parts.push(`symptoms: ${l.symptoms.join(", ")}`);
      if (l.note) parts.push(`note: "${l.note}"`);
      return `- ${l.date}: ${parts.join(", ")}`;
    }).join("\n")
  : "- No logs recorded yet"}

HORMONE REPORTS:
${hormoneReports?.length > 0
  ? hormoneReports.map(r =>
      `${r.title}:\n` + r.markers.map(m => `  - ${m.name}: ${m.value} ${m.unit} (${m.status})`).join("\n")
    ).join("\n")
  : "- No hormone reports uploaded yet"}

Answer based only on the data above. If data is missing, say so honestly. Keep responses under 200 words unless the question genuinely needs more detail.`;
}
