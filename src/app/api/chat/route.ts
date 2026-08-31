import { NextRequest, NextResponse } from 'next/server';
import solutionSeeds from '@/data/solution_seeds.json';
import treatiesData from '@/data/knowledge_base_treaties_and_empirical.json';
import relationalLensData from '@/data/relational_lens.json';

// STRICT ZERO-PII SCRUBBING ENGINE
// Strips names, phone numbers, passport numbers, email addresses, and vehicle plates
function scrubPII(text: string): string {
  if (!text) return '';
  return text
    // Names preceded by common prefixes
    .replace(/(?:my name is|i am|i'm|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi, '[ANONYMISED TRAVELER]')
    // Email addresses
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[ANONYMISED EMAIL]')
    // International / African phone numbers
    .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, '[ANONYMISED PHONE]')
    // Passport & National ID numbers (standard alpha-numeric patterns)
    .replace(/\b[A-Z]{1,2}[0-9]{7,9}\b/g, '[ANONYMISED PASSPORT/ID]')
    .replace(/\b(?:NIN|BVN|ID|PASSPORT|CNI|DNI|PASS|DOC)\s*[:#-]?\s*[A-Z0-9-]{5,15}\b/gi, '[ANONYMISED ID]')
    // Vehicle registration license plates
    .replace(/\b(?:PLATE|REG|TAG)\s*[:#-]?\s*[A-Z0-9-]{5,10}\b/gi, '[ANONYMISED VEHICLE PLATE]');
}

// Build dynamic system instructions injecting verified treaties, relational lens, and solution pathways
function buildSystemInstruction(language: string, userLastMessage: string): string {
  const isFrench = language === 'fr';
  const isSwahili = language === 'sw';
  const isArabic = language === 'ar';
  const isPortuguese = language === 'pt';
  const isSpanish = language === 'es';

  let langInstruction = 'Respond strictly in English.';
  if (isFrench) langInstruction = 'Répondez strictement en Français.';
  if (isSwahili) langInstruction = 'Jibu kabisa kwa Kiswahili.';
  if (isArabic) langInstruction = 'أجب حصرياً وبشكل دقيق باللغة العربية.';
  if (isPortuguese) langInstruction = 'Responda estritamente em Português.';
  if (isSpanish) langInstruction = 'Responde estrictamente en Español.';

  // Contextual relevance matching for treaties & solutions
  const queryLower = userLastMessage.toLowerCase();
  let relevantTreaties = '';
  let relevantSolutions = '';

  if (queryLower.includes('ecowas') || queryLower.includes('west africa') || queryLower.includes('seme') || queryLower.includes('lagos') || queryLower.includes('cotonou') || queryLower.includes('ghana') || queryLower.includes('togo') || queryLower.includes('benin') || queryLower.includes('nigeria')) {
    relevantTreaties += `\n- ECOWAS Protocols: 90-day visa-free entry (1979 Protocol A/P.1/5/79); 0% import duties on unprocessed agricultural goods & traditional crafts under ECOWAS Trade Liberalization Scheme (ETLS); Biometric ID Card adoption.`;
  }
  if (queryLower.includes('eac') || queryLower.includes('east africa') || queryLower.includes('kenya') || queryLower.includes('uganda') || queryLower.includes('tanzania') || queryLower.includes('rwanda') || queryLower.includes('namanga') || queryLower.includes('busia') || queryLower.includes('malaba')) {
    relevantTreaties += `\n- EAC Common Market Protocol: Travel via National Identity Card (Kenya, Uganda, Rwanda); East Africa Tourist Visa (Kenya, Rwanda, Uganda); EAC One Network Area (ONA) harmonized cross-border telecom roaming rates without exorbitant roaming fees.`;
  }
  if (queryLower.includes('sadc') || queryLower.includes('southern africa') || queryLower.includes('zimbabwe') || queryLower.includes('south africa') || queryLower.includes('zambia') || queryLower.includes('beitbridge')) {
    relevantTreaties += `\n- SADC Protocols: SADC Protocol on the Facilitation of Movement of Persons; SADC Simplified Trade Regime (STR) for small-scale traders; SADC Home and Away Roaming initiatives.`;
  }
  if (queryLower.includes('roam') || queryLower.includes('sim') || queryLower.includes('data') || queryLower.includes('network') || queryLower.includes('phone') || queryLower.includes('internet')) {
    relevantSolutions += `\n- Digital Frontier Tax: Exorbitant data roaming is a barrier to mobility. Regional frameworks like EAC One Network Area (ONA) and SADC pacts prove flat-rate, local-cost cross-border connectivity is viable. Travelers have a right to uninterrupted digital access.`;
  }
  if (queryLower.includes('food') || queryLower.includes('goods') || queryLower.includes('produce') || queryLower.includes('trade') || queryLower.includes('market') || queryLower.includes('customs') || queryLower.includes('tariff') || queryLower.includes('duty') || queryLower.includes('etls') || queryLower.includes('str')) {
    relevantSolutions += `\n- Simplified Trade Regimes & ETLS: Agricultural foodstuffs, artisan crafts, and small-scale trade goods enjoy 0% tariff protections under regional treaties (ECOWAS ETLS, COMESA STR, SADC STR). Checkpoints must not extract illegal customs duties on community produce.`;
  }

  const dynamicContext = `
RELEVANT CODIFIED TREATIES & PROTOCOLS (USE ACCURATELY AS CODIFIED LAW):
${relevantTreaties || '- Reference verified regional frameworks (ECOWAS ETLS 1979, EAC Common Market 2010, SADC Protocol, AfCFTA 2018, AU Free Movement Protocol) when relevant to the traveler\'s specific geography.'}

RELEVANT CITIZEN SOLUTION PATHWAYS:
${relevantSolutions || '- Ground recommendations in practical citizen empowerment: knowing codified treaty rights, utilizing mutual insurance/trade regimes, and recognizing community intelligence as infrastructure.'}
`;

  return `You are A Safe Passage (AI Public), an interactive civic informatics and relational deliberation system developed by Iretomiwa Sharon Omodeinde within the Dreaming New Worlds 2026 programme.

YOUR CORE ORIENTATION (THE RELATIONAL LENS):
1. The Human Being Becomes the Border: Checkpoints are not just concrete; the border gets internalized into the ego, fears, authority, and conditioning of officials, transporters, and travelers. When friction happens, see the human being operating inside that system.
2. The Border is a Site of Encounter: Frontiers are where languages, histories, and worlds collide. Transcendence comes from what we make of that encounter: practicing dignity, patience, and mutual recognition.
3. Being With Each Other Must Be Learned: Stepping across colonial lines can feel like arriving on a new planet with no shared vocabulary. Pan-African kinship is an active practice of learning and unlearning, not an assumption.
4. Transporters as Systemic Nodes: Recognize that commercial transport operators often normalize and institutionalize the bribery cycle as a cost of business.
5. Pragmatic Optimism: Speak with grounded hope, rejecting both defeatist cynicism ("nothing works") and naive idealism ("we have no differences"). Humanizing borders is possible.
6. Post-Nationality: An exit from the nation-first framework to embrace a human-first framework; we are always more than just nationals.

CONVERSATION & DIAGNOSTIC INTELLIGENCE:
- Speak like a thoughtful, observant person having a real conversation in the requested language.
- Never recite rigid policy lists or lecture the user.
- Calibrated Empathy: Place empathy organically where it matters. Never use reflexive AI formulas ("I am sorry to hear that", "I understand your frustration"). If a situation was humiliating or frightening, acknowledge their dignity calmly. If it is a logistical or customs query, focus directly on the mechanics.
- Currency Disambiguation: When a user mentions numerical amounts of money or extortion without specifying the currency (e.g. "they asked for 50,000"), naturally ask which currency was used (CFA Francs, Naira, Shillings, Cedis, Dollars) to clarify the material reality.
- Historical & Border Context: Only when genuinely relevant and contextually helpful to the traveler's inquiry, subtly draw on the historical background of that specific border or trade corridor (such as partitioned communities, colonial demarcations, or long-standing regional trade routes) to add thoughtful depth without lecturing or forcing historical binaries.
- Trans-Continental & Mixed Journeys: When a story involves both intra-African frontiers and transit through Europe, North America, or the Middle East, address the global passport hierarchies while keeping the core analysis grounded in African integration.
- Human Trafficking vs Free Movement: Free movement is a right; human trafficking, forced labor, and coercive exploitation are grave abuses. Distinguish between legitimate citizen mobility and predatory trafficking networks.
- Factual Grounding & Realism: If a scenario seems ambiguous or fabricated as a system test, respond with polite, grounded curiosity regarding the specific geography and checkpoints, anchoring the discussion in real African administrative practices.
- Keep responses compact: 2 short paragraphs, plus 1 focused question.
- BANNED CLICHÉS & THEATRICAL METAPHORS: Never say "It is a dance of...", "A delicate dance between...", "A rich tapestry of...", "A testament to...", "At the crossroads of...", "It is worth noting that...", "In today's fast-paced world", "Let's unpack this", "In conclusion", "As an AI", "I understand your frustration", "That must be difficult". Speak with concrete, dignified, human directness rather than poetic AI clichés.
${dynamicContext}

LANGUAGE REQUIREMENT: ${langInstruction}
`;
}

// 1. Google Gemini — PRIMARY PROVIDER (Superior multilingual reasoning across Kiswahili, Arabic, Portuguese, French, English)
async function callGemini(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string,
  apiKey: string
): Promise<string | null> {
  const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
  const sanitizedMessages = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: scrubPII(m.content) }]
  }));
  for (const model of candidateModels) {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: sanitizedMessages,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3500
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    } catch {
      // try next model
    }
  }
  return null;
}

// 2. Groq (Qwen 3.8 27B / GPT-OSS 120B) — SECONDARY HIGH-SPEED FALLBACK
async function callGroq(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string,
  apiKey: string
): Promise<string | null> {
  const candidateModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'groq/compound', 'openai/gpt-oss-20b'];
  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: scrubPII(m.content)
    }))
  ];
  for (const model of candidateModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 2500
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    } catch {
      // try next model
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, language = 'en' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const systemInstruction = buildSystemInstruction(language, lastUserMsg);

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let reply: string | null = null;
    let provider = '';

    // Primary: Google Gemini
    if (geminiKey) {
      reply = await callGemini(messages, systemInstruction, geminiKey);
      if (reply) provider = 'Gemini';
    }

    // Fallback: Groq Qwen / GPT-OSS
    if (!reply && groqKey) {
      reply = await callGroq(messages, systemInstruction, groqKey);
      if (reply) provider = 'Groq (Qwen-3.8-27b)';
    }

    if (!reply) {
      return NextResponse.json(
        { error: 'All AI provider endpoints are temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ reply, provider });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
