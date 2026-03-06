import Anthropic from "@anthropic-ai/sdk";

// Tell Vercel to allow up to 10MB request bodies (PDFs can be large as base64)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileBase64, mediaType, cyclePhase } = req.body;

  if (!fileBase64 || !mediaType) {
    return res.status(400).json({ error: "fileBase64 and mediaType are required" });
  }

  // Claude Vision supports these document/image types
  const supportedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!supportedTypes.includes(mediaType)) {
    return res.status(400).json({ error: `Unsupported file type: ${mediaType}` });
  }

  try {
    // Build the content block depending on whether it's a PDF or image
    // PDFs go as document blocks; images go as image blocks
    const contentBlock =
      mediaType === "application/pdf"
        ? {
            type: "document",
            source: { type: "base64", media_type: mediaType, data: fileBase64 },
          }
        : {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: fileBase64 },
          };

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16384,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text: buildExtractionPrompt(cyclePhase),
            },
          ],
        },
      ],
    });

    const raw = response.content[0]?.text || "{}";
    console.log("[extract] Claude raw response:", raw.slice(0, 500));

    let markers = [];
    let reportDate = null;
    try {
      const stripped = raw.replace(/```json\n?|```/g, "").trim();
      const jsonStart = stripped.indexOf("{");
      const jsonEnd = stripped.lastIndexOf("}");
      const jsonStr = jsonStart >= 0 && jsonEnd > jsonStart
        ? stripped.slice(jsonStart, jsonEnd + 1)
        : stripped;
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        markers = parsed;
      } else {
        markers = Array.isArray(parsed.markers) ? parsed.markers : [];
        reportDate = parsed.date || null;
      }
    } catch (e) {
      console.error("[extract] JSON parse failed:", e.message);
      markers = [];
    }

    return res.status(200).json({ markers, reportDate });
  } catch (error) {
    console.error("Extract API error:", error);
    return res.status(500).json({ error: "Failed to read the report. Please try again." });
  }
}

function buildExtractionPrompt(cyclePhase) {
  const phaseContext = cyclePhase && cyclePhase !== "Not sure"
    ? `The patient was in the ${cyclePhase} phase of their menstrual cycle when this test was taken. Use phase-specific reference ranges for hormone tests (e.g. LH, FSH, estradiol, progesterone) — these vary significantly by cycle phase. If the PDF does not provide a reference range for a hormone, apply standard clinical reference ranges for the ${cyclePhase} phase.`
    : `Use standard clinical reference ranges. If no range is provided in the PDF for a hormone test, apply typical mid-cycle ranges as a reasonable default and note that phase information was not provided.`;

  return `You are a medical lab report parser. Extract all test results from this document.

${phaseContext}

IMPORTANT: Dates in Indian lab reports are in DD/MM/YYYY or DD/MM/YY format. Convert to YYYY-MM-DD when returning.

Extract every individual test result — ignore section heading rows that have no numeric result.

SKIP these — do not include them in output:
- Urine microscopy fields (pus cells, epithelial cells, casts, crystals, bacteria)
- Calculated ratios (e.g. albumin/globulin ratio, LDL/HDL ratio)
- Duplicate rows that are sub-components already captured by a parent test

Return ONLY a JSON object, nothing else, in this exact shape:
{
  "date": "YYYY-MM-DD or null if not found in the document",
  "markers": [
    { "name": "...", "value": "...", "unit": "...", "low": number|null, "high": number|null, "status": "normal"|"low"|"high"|null }
  ]
}

For each marker:
- name: the test name (string)
- value: the measured value (string, keep units separate)
- unit: the unit of measurement (string, e.g. "mIU/L", "ng/dL", "%" — empty string if none)
- low: lower bound of reference range AS PRINTED IN THE DOCUMENT (number or null if not shown)
- high: upper bound of reference range AS PRINTED IN THE DOCUMENT (number or null if not shown)
- status: compare value to the printed reference range only
  - "normal" if value is within the printed range
  - "low" if value is below the printed range
  - "high" if value is above the printed range
  - null if no reference range is printed — do NOT guess

Example output:
{"date":"2026-01-24","markers":[{"name":"TSH","value":"2.4","unit":"mIU/L","low":0.5,"high":4.5,"status":"normal"},{"name":"LH","value":"14.2","unit":"mIU/mL","low":1.9,"high":12.5,"status":"high"},{"name":"DHEAS","value":"180","unit":"µg/dL","low":null,"high":null,"status":null}]}

If no lab results, return: {"date":null,"markers":[]}`;
}
