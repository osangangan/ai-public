import { NextRequest, NextResponse } from 'next/server';
import knowledgeBase from '@/data/knowledge_base_treaties_and_empirical.json';
import relationalLensData from '@/data/relational_lens.json';

// PII Scrubber
function scrubPII(text: string): string {
  if (!text) return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g, '[REDACTED_PHONE]')
    .replace(/\b[A-Z]{1,2}[0-9]{7,9}\b/g, '[REDACTED_PASSPORT_NUMBER]');
}

// Extract lightweight contextual hints only if user conversation mentions specific domains
function getDynamicContext(userText: string): string {
  const lower = userText.toLowerCase();
  const hints: string[] = [];

  if (lower.includes('roam') || lower.includes('data') || lower.includes('internet') || lower.includes('sim') || lower.includes('phone') || lower.includes('network') || lower.includes('réseau') || lower.includes('itinérance') || lower.includes('mtandao') || lower.includes('انترنت') || lower.includes('اتصال') || lower.includes('dados') || lower.includes('roaming')) {
    hints.push('• Connectivity & Roaming: High roaming fees act as a digital border tax. Frameworks like EAC/SADC One Network Area (ONA) prove cross-border flat-rate data is possible.');
  }

  if (lower.includes('produce') || lower.includes('goods') || lower.includes('trade') || lower.includes('cargo') || lower.includes('custom') || lower.includes('douane') || lower.includes('marchandise') || lower.includes('farm') || lower.includes('harvest') || lower.includes('bidhaa') || lower.includes('biashara') || lower.includes('جمارك') || lower.includes('بضائع') || lower.includes('mercadoria') || lower.includes('alfândega')) {
    hints.push('• Small Trade & Goods: Mechanisms like ECOWAS ETLS (0% agricultural tariffs) and COMESA/SADC Simplified Trade Regimes (STR) exist to protect everyday cross-border traders from arbitrary checkpoint extortion.');
  }

  if (lower.includes('copyright') || lower.includes('music') || lower.includes('ip') || lower.includes('art') || lower.includes('software') || lower.includes('design') || lower.includes('brand') || lower.includes('propriété') || lower.includes('sanaa') || lower.includes('ابتكار') || lower.includes('ملكية') || lower.includes('marca') || lower.includes('autoral')) {
    hints.push('• Intellectual Property: Africa is split between ARIPO, OAPI, and non-members like Nigeria/South Africa. While AfCFTA IPR Protocol binds states on paper, domestic registry backlogs leave creators exposed when crossing frontiers.');
  }

  if (lower.includes('flight') || lower.includes('transit') || lower.includes('airport') || lower.includes('bus') || lower.includes('luggage') || lower.includes('visa') || lower.includes('connection') || lower.includes('vol') || lower.includes('bagage') || lower.includes('safari') || lower.includes('ndege') || lower.includes('visa') || lower.includes('تأشيرة') || lower.includes('طيران') || lower.includes('عبور') || lower.includes('viagem') || lower.includes('visto')) {
    hints.push('• Transit & Passage: Over-militarized checkpoints and lack of open skies (SAATM) create arbitrary bottlenecks. Formal transport operators often normalize extortion into travel fares.');
  }

  return hints.length > 0 ? `\nRELEVANT SYSTEM HINTS (use subtly if helpful, do not force):\n${hints.join('\n')}` : '';
}

function buildSystemInstruction(language: string, fullConversationText: string): string {
  const dynamicContext = getDynamicContext(fullConversationText);
  
  let langInstruction = 'Respond in natural, grounded, conversational English.';
  if (language === 'sw') {
    langInstruction = 'Jibu kwa Kiswahili fasaha, cha asili, chenye heshima na hisia za kibinadamu — epuka maneno magumu ya kiteknolojia au jibu linalofanana na roboti.';
  } else if (language === 'ar') {
    langInstruction = 'أجب باللغة العربية الطبيعية، الدافئة، الإنسانية والواضحة — تجنب المصطلحات الآلية أو الأسلوب الجاف.';
  } else if (language === 'pt') {
    langInstruction = 'Responda em português natural, caloroso, fluído e humano — evite jargões acadêmicos rígidos ou tom robótico.';
  } else if (language === 'fr') {
    langInstruction = 'Réponds en français naturel, chaleureux, fluide et humain — évite les tournures académiques ou les formules de robot.';
  } else if (language === 'es') {
    langInstruction = 'Responde en español natural, cálido, fluido y humano — evita jergas académicas rígidas o tono robótico.';
  }

  return `You are a thoughtful conversational companion for "A Safe Passage" — a civic initiative exploring the lived reality of moving across African borders (with people, goods, and data).

YOUR CORE ORIENTATION (THE RELATIONAL LENS):
1. The Human Being Becomes the Border: Checkpoints are not just concrete; the border gets internalized into the ego, fears, authority, and conditioning of officials, transporters, and travelers. When friction happens, see the human being operating inside that system.
2. The Border is a Site of Encounter: Frontiers are where languages, histories, and worlds collide. Transcendence comes from what we make of that encounter—practicing dignity, patience, and mutual recognition.
3. Being With Each Other Must Be Learned: Stepping across colonial lines can feel like arriving on a new planet with no shared vocabulary. Pan-African kinship is an active practice of learning and unlearning, not an assumption.
4. Transporters as Systemic Nodes: Recognize that commercial transport operators often normalize and institutionalize the bribery cycle as a cost of business.
5. Pragmatic Optimism: Speak with grounded hope—rejecting both defeatist cynicism ("nothing works") and naive idealism ("we have no differences"). Humanizing borders is possible.
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
  const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
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
            temperature: 0.5, 
            topP: 0.85, 
            maxOutputTokens: 1200,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn('[Gemini] Model ' + model + ' failed:', e);
    }
  }
  return null;
}

// 2. Groq — SECONDARY / FAST FALLBACK
async function callGroq(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string,
  apiKey: string
): Promise<string | null> {
  const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound'];
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
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          temperature: 0.5,
          max_tokens: 1200
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (e) {
      console.warn(`[Groq] Model ${model} failed:`, e);
    }
  }
  return null;
}

// 3. OpenRouter — TERTIARY FALLBACK
async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string,
  apiKey: string
): Promise<string | null> {
  try {
    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: scrubPII(m.content)
      }))
    ];
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: formattedMessages,
        temperature: 0.5,
        max_tokens: 1200
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || null;
    }
  } catch (e) {
    console.warn('[OpenRouter] Failed:', e);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const { messages, language = 'en' } = body;
    const fullConversationText = messages.map((m: any) => m.content).join(' ');
    const systemInstruction = buildSystemInstruction(language, fullConversationText);

    const geminiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    const groqKey = (process.env.GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    const openrouterKey = (process.env.OPENROUTER_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    let replyText: string | null = null;
    let successfulProvider = '';

    // 1. Gemini as Primary
    if (geminiKey) {
      replyText = await callGemini(messages, systemInstruction, geminiKey);
      if (replyText) successfulProvider = 'Gemini';
    }

    // 2. Groq as Fallback
    if (!replyText && groqKey) {
      console.log('[Fallback] Trying Groq...');
      replyText = await callGroq(messages, systemInstruction, groqKey);
      if (replyText) successfulProvider = 'Groq';
    }

    // 3. OpenRouter as Tertiary Fallback
    if (!replyText && openrouterKey) {
      console.log('[Fallback] Trying OpenRouter...');
      replyText = await callOpenRouter(messages, systemInstruction, openrouterKey);
      if (replyText) successfulProvider = 'OpenRouter';
    }

    if (!replyText) {
      return NextResponse.json(
        { error: 'All AI providers are currently unavailable. Please try again shortly.' },
        { status: 502 }
      );
    }

    console.log('[SafePassage] Response via ' + successfulProvider + ' (' + language + ')');
    return NextResponse.json({ reply: replyText, language, provider: successfulProvider });

  } catch (error: any) {
    console.error('[SafePassage Route Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
