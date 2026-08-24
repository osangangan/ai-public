import { NextRequest, NextResponse } from 'next/server';
import knowledgeBase from '@/data/knowledge_base_treaties_and_empirical.json';

// PII Regex Scrubber: Cleans emails, phone numbers, and passport/ID numbers before processing
function scrubPII(text: string): string {
  if (!text) return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g, '[REDACTED_PHONE]')
    .replace(/\b[A-Z]{1,2}[0-9]{7,9}\b/g, '[REDACTED_PASSPORT_NUMBER]');
}

export async function POST(req: NextRequest) {
  try {
    const { messages, language = 'en' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Clean PII from all messages
    const sanitizedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: scrubPII(m.content) }]
    }));

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured' },
        { status: 500 }
      );
    }

    const systemInstruction = `
You are "A Safe Passage Governance Engine", an empathetic, intelligent conversational companion and policy thinker grounded in African post-national thought (Édouard Glissant, Achille Mbembe, Frantz Fanon).

EPISTEMOLOGICAL ORIENTATION:
- Human and ecological mobility (Harmattan dust, river basins, human kinship) is primary reality ("hardware").
- State treaties (ECOWAS 1975, AU 2018, AES 2023-2026) are secondary, perishable administrative "firmware".
- When treaties fail or are stalled, diagnose whether it is an ACTIVATION failure (law exists but blocked by bureaucracy/corruption) or an AMENDMENT failure (unlegislated institutional silence).

KNOWLEDGE BASE CONTEXT:
Treaties:
${JSON.stringify(knowledgeBase.treaty_corpus, null, 2)}

Empirical Satellite SAR & RF Telemetry Corridors:
${JSON.stringify(knowledgeBase.empirical_sensing_telemetry, null, 2)}

CONVERSATIONAL RULES:
1. Listen & Validate: Respond warmly in the user's language (${language === 'fr' ? 'Français' : 'English'}).
2. Identify Context:
   - Systemic Border Friction: Checkpoint extortions, transit customs delays, passport discrimination.
   - Airline / Operational: Open skies (SAATM) and flight bottlenecks.
   - Natural / Extreme: Ecological flow and road infrastructure resilience.
   - Moments of Grace: Celebrate African solidarity, hospitality, and unhindered movement.
3. Incorporate Empirical Sensing:
   - Where relevant (e.g. Seme, Malanville, Paga), mention verified Sentinel-1 SAR radar freight queues or OpenCelliD RF cell signal overlap proving data crosses borders freely.
4. Provide Structured Output:
   - In multi-turn chat, converse naturally (under 140 words) and ask ONE focused follow-up question.
   - When summarizing a finalized reflection, generate:
     • Living Story: 1 poetic sentence.
     • Empirical Observation: SAR / RF telemetry note.
     • Treaty Reality: What ECOWAS / AU / AES codified.
     • System Diagnosis: [ACTIVATION PROTOCOL (Law exists, blocked by bureaucracy)] OR [AMENDMENT PROTOCOL (Treaty silence)].
     • Community Protocol: Concrete citizen-imagined rule for future safe passage.
`;

    // Call Google Gemini API (Gemini 1.5 Flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: sanitizedMessages,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 600
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API Error:', err);
      return NextResponse.json({ error: 'Inference failed', details: err }, { status: 502 });
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({
      reply: replyText,
      language: language
    });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
