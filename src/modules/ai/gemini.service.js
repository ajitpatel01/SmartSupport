import { createAgent, gemini } from '@inngest/agent-kit';
import { env } from '../../config/env.js';
import { retryWithBackoff } from '../../utils/retryWithBackoff.js';
import { analysisResultSchema } from './schemas/analysisResult.js';
import { SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, buildUserPrompt } from './prompts/ticketAnalysis.js';
import logger from '../../config/logger.js';

function createSupportAgent() {
  return createAgent({
    model: gemini({
      model: 'gemini-1.5-flash-8b',
      apiKey: env.GEMINI_API_KEY,
    }),
    name: 'AI Ticket Triage Assistant',
    system: SYSTEM_PROMPT,
  });
}

/**
 * Parses the raw AI response string into validated JSON.
 * Handles both clean JSON and markdown-fenced JSON.
 */
function parseGeminiResponse(raw) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonString = fenced ? fenced[1] : raw.trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${jsonString.slice(0, 200)}`);
  }

  const result = analysisResultSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`AI response schema validation failed: ${issues}`);
  }

  return result.data;
}

/**
 * Analyzes a support ticket using Gemini AI with few-shot examples.
 * Returns a validated analysis result.
 *
 * @param {string} title
 * @param {string} description
 * @returns {Promise<import('./schemas/analysisResult.js').AnalysisResult>}
 */
export async function analyzeTicketWithGemini(title, description) {
  return retryWithBackoff(async () => {
    const agent = createSupportAgent();

    const prompt = [
      ...FEW_SHOT_EXAMPLES.map((ex) => `${ex.role}: ${ex.content}`),
      `user: ${buildUserPrompt(title, description)}`,
    ].join('\n\n');

    const response = await agent.run(prompt);
    const raw = response.output[0].context;

    logger.debug('Gemini raw response', { raw: raw.slice(0, 500) });

    return parseGeminiResponse(raw);
  }, 3);
}
