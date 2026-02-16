/**
 * ============================================
 *  AI / LLM Service – Study Plan Generator
 * ============================================
 *  OpenRouter (OpenAI-compatible API)
 *  Robust against invalid JSON + slow models
 */

const OpenAI = require('openai');
const AppError = require('../utils/AppError');

let openai;

/**
 * Initialize OpenRouter client
 * (keeping env name OPENAI_API_KEY as requested)
 */
const getClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "EduAI Study Planner"
      }
    });
  }
  return openai;
};

/**
 * System prompt
 */
const buildSystemPrompt = () => `
You are an expert educational planner and learning coach.
Create a personalized, realistic, structured study plan.

IMPORTANT:
Return ONLY valid JSON. No markdown. No explanations.

JSON FORMAT:
{
  "planTitle": "string",
  "totalDays": number,
  "overview": "string",
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "dayNumber": 1,
      "dailySummary": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "duration": 30,
          "topic": "string",
          "type": "study",
          "order": 1
        }
      ]
    }
  ],
  "tips": ["string"],
  "milestones": [
    { "day": 7, "description": "Complete fundamentals" }
  ]
}

STRICT RULE: Do NOT include any text before or after the JSON. No markdown backticks.
`;

/**
 * User prompt builder
 */
const buildUserPrompt = (planData) => {
  const {
    goal,
    deadline,
    dailyHours,
    currentLevel,
    topics,
    weakAreas,
    preferredStudyTime,
    breakPreference,
  } = planData;

  const today = new Date().toISOString().split('T')[0];
  const deadlineStr = new Date(deadline).toISOString().split('T')[0];

  const daysAvailable = Math.min(
    60,
    Math.max(1, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
  );

  return `
GOAL: ${goal}
TOPICS: ${topics.join(', ')}
WEAK AREAS: ${weakAreas?.length ? weakAreas.join(', ') : 'None'}
CURRENT LEVEL: ${currentLevel}
DAILY HOURS: ${dailyHours}
START DATE: ${today}
DEADLINE: ${deadlineStr}
DAYS AVAILABLE: ${daysAvailable}
STUDY TIME: ${preferredStudyTime || 'morning'}
BREAK STYLE: ${breakPreference || 'pomodoro'}


Generate a day-by-day study schedule (max 60 days).
If the number of days is large (e.g. > 30), be very concise with task descriptions to avoid cutting off.
`;
};

/**
 * Generate study plan
 */
const generateStudyPlan = async (planData) => {
  try {
    const client = getClient();

    const model =
      process.env.OPENAI_MODEL ||
      'meta-llama/llama-3.1-8b-instruct';

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(planData) },
      ],
      temperature: 0.7,
      max_tokens: 6000 // Increased to support longer schedules (up to 60 days)
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new AppError('AI returned an empty response', 502);
    }

    // =========================================
    // 🔥 ROBUST JSON CLEANING + EXTRACTION
    // =========================================

    let cleaned = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("Raw AI output:", cleaned);
      throw new AppError('AI response does not contain JSON', 502);
    }

    cleaned = cleaned.slice(firstBrace, lastBrace + 1);

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Invalid JSON received:", cleaned);
      throw new AppError('AI returned invalid JSON format', 502);
    }

    if (!parsed.schedule || !Array.isArray(parsed.schedule)) {
      throw new AppError('AI response missing schedule array', 502);
    }

    return parsed;

  } catch (error) {

    if (error instanceof AppError) throw error;

    if (error?.status === 429) {
      throw new AppError(
        'AI rate limit exceeded. Please try again later.',
        429
      );
    }

    if (error?.status === 401) {
      throw new AppError(
        'AI service authentication failed. Check API key.',
        500
      );
    }

    console.error('AI Service Error:', error);

    throw new AppError(
      'Failed to generate study plan. Please try again.',
      502
    );
  }
};

module.exports = { generateStudyPlan };
