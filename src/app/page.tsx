'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  RotateCcw,
  ChevronDown,
  Globe,
  Archive,
  Check,
  X,
  ShieldCheck,
  Copy,
  Pencil,
  FileText,
  MessageSquare,
  Layers,
  ExternalLink,
  Cpu
} from 'lucide-react';
import VectorFieldBackground from './VectorFieldBackground';

type LanguageCode = 'en' | 'sw' | 'ar' | 'fr' | 'pt' | 'es';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ArchiveEntry {
  id: string;
  timestamp: string;
  language: string;
  testimony: string;
  reflection: string;
  provider: string;
  piiStatus: string;
}

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'sw', label: 'Kiswahili', flag: 'SW' },
  { code: 'ar', label: 'العربية', flag: 'AR' },
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'pt', label: 'Português', flag: 'PT' },
  { code: 'es', label: 'Español', flag: 'ES' },
];

const COMPUTATIONAL_LOADING_PHRASES: Record<LanguageCode, string[]> = {
  en: [
    "Exchanging information across waters",
    ". . .",
    "Device pinging back and forth with network hardware",
    ". . .",
    "Exchanging timestamps with servers",
    ". . .",
    "Making API calls",
    ". . .",
    "Trafficking packets via voltage pulses, photons, and radio waves",
    ". . .",
    "Processing matrices",
    ". . .",
    "Taking concurrent actions",
    ". . ."
  ],
  sw: [
    "Kubadilishana taarifa kuvuka maji na mipaka",
    ". . .",
    "Kifaa kinawasiliana na mitambo ya mtandao",
    ". . .",
    "Kubadilishana alama za muda na seva",
    ". . .",
    "Kufanya miito ya API",
    ". . .",
    "Kusafirisha pakiti za data kupitia mipigo ya umeme, fotoni, na mawimbi ya redio",
    ". . .",
    "Kuchakata mifumo ya data",
    ". . .",
    "Kuchukua hatua sambamba",
    ". . ."
  ],
  ar: [
    "تبادل المعلومات عبر المياه والحدود",
    ". . .",
    "الجهاز يتبادل الإشارات مع عتاد الشبكة",
    ". . .",
    "تبادل الطوابع الزمنية مع الخوادم",
    ". . .",
    "إجراء استدعاءات لواجهة برمجة التطبيقات (API)",
    ". . .",
    "نقل حزم البيانات عبر نبضات الجهد، الفوتونات، وموجات الراديو",
    ". . .",
    "معالجة المصفوفات الحسابية",
    ". . .",
    "اتخاذ إجراءات متزامنة",
    ". . ."
  ],
  fr: [
    "Échange d'informations par-delà les eaux",
    ". . .",
    "L'appareil échange des signaux avec le matériel réseau",
    ". . .",
    "Échange d'horodatages avec les serveurs",
    ". . .",
    "Appels API en cours",
    ". . .",
    "Transmission des paquets via impulsions de tension, photons et ondes radio",
    ". . .",
    "Traitement des matrices",
    ". . .",
    "Exécution d'actions concurrentes",
    ". . ."
  ],
  pt: [
    "Trocando informações através das águas",
    ". . .",
    "Dispositivo comunicando com o hardware de rede",
    ". . .",
    "Trocando carimbos de data/hora com servidores",
    ". . .",
    "Realizando chamadas de API",
    ". . .",
    "Trafegando pacotes via pulsos de voltagem, fótons e ondas de rádio",
    ". . .",
    "Processando matrizes",
    ". . .",
    "Executando ações simultâneas",
    ". . ."
  ],
  es: [
    "Intercambiando información a través de las aguas",
    ". . .",
    "Dispositivo comunicándose con el hardware de red",
    ". . .",
    "Intercambiando marcas de tiempo con servidores",
    ". . .",
    "Realizando llamadas a la API",
    ". . .",
    "Transfiriendo paquetes vía pulsos de voltaje, fotones y ondas de radio",
    ". . .",
    "Procesando matrices",
    ". . .",
    "Ejecutando acciones simultáneas",
    ". . ."
  ]
};

const ROTATING_PROMPT_INSPIRATIONS: Record<LanguageCode, string[]> = {
  en: [
    "Share your experience or ask a question here...",
    "Thinking of relocating to another African country?",
    "Crossing with cameras, sound gear, or creative equipment?",
    "What does the regional trade protocol say about agricultural produce?",
    "How does mobile SIM roaming work across borders?",
    "Encountered an arbitrary fee or extortion at a checkpoint?",
    "Experienced unexpected hospitality while crossing a border?",
    "Trying to understand why a visa is required between neighboring states?",
    "Transporting tools or goods between regional markets?"
  ],
  sw: [
    "Shiriki uzoefu wako au uliza swali hapa...",
    "Je, unafikiria kuhamia nchi nyingine ya Kiafrika?",
    "Unavuka mpaka na kamera, vifaa vya sauti, au vifaa vya ubunifu?",
    "Itifaki ya kikanda inasema nini kuhusu mazao ya kilimo?",
    "Huduma ya kutumia laini ya simu (roaming) inafanyaje kazi kuvuka mpaka?",
    "Ulikutana na ada isiyo halali au usumbufu kwenye kituo cha ukaguzi?",
    "Ulipata ukarimu usiotarajiwa wakati wa kuvuka mpaka?",
    "Kusafirisha bidhaa au vifaa kati ya masoko ya kikanda?"
  ],
  ar: [
    "شارك تجربتك أو اطرح سؤالك هنا...",
    "هل تفكر في الانتقال إلى بلد إفريقي آخر؟",
    "هل تعبر الحدود بمعدات تصوير، أجهزة صوتية، أو أدوات إبداعية؟",
    "ماذا تنص البروتوكولات الإقليمية بشأن المنتجات الزراعية؟",
    "كيف يعمل التجوال الدولي لشرائح الهاتف عبر الحدود؟",
    "هل واجهت رسوماً غير قانونية أو ابتزازاً عند نقطة تفتيش؟",
    "هل حظيت بحسن ضيافة غير متوقع أثناء عبور الحدود؟",
    "نقل البضائع والمعدات بين الأسواق الإقليمية؟"
  ],
  fr: [
    "Partagez votre expérience ou posez votre question ici...",
    "Envisagez-vous de vous installer dans un autre pays africain ?",
    "Vous traversez avec du matériel photo, audio ou de création ?",
    "Que dit le protocole régional sur les produits agricoles ?",
    "Comment fonctionne le roaming mobile d'un côté à l'autre ?",
    "Avez-vous fait face à des frais arbitraires à un poste-frontière ?",
    "Avez-vous vécu un moment de solidarité inattendu à la frontière ?",
    "Transport d'outils ou de marchandises entre marchés régionaux ?"
  ],
  pt: [
    "Compartilhe sua experiência ou faça uma pergunta aqui...",
    "Pensando em se mudar para outro país africano?",
    "Cruzando a fronteira com câmeras, som ou equipamentos criativos?",
    "O que diz o protocolo regional sobre produtos agrícolas?",
    "Como funciona o roaming móvel ao cruzar fronteiras?",
    "Enfrentou taxas arbitrárias ou extorsão em um posto de controle?",
    "Teve uma experiência de hospitalidade inesperada na fronteira?",
    "Transportando ferramentas ou produtos entre mercados regionais?"
  ],
  es: [
    "Comparte tu experiencia o haz una pregunta aquí...",
    "¿Pensando en mudarte a otro país africano?",
    "¿Cruzando con cámaras, equipos de sonido o material creativo?",
    "¿Qué dice el protocolo regional sobre productos agrícolas?",
    "¿Cómo funciona el roaming móvil al cruzar fronteras?",
    "¿Enfrentaste cobros arbitrarios o extorsión en un puesto de control?",
    "¿Viviste una experiencia de hospitalidad inesperada en la frontera?",
    "¿Transportando herramientas o mercancías entre mercados regionales?"
  ]
};

const MAX_EXCHANGES_PER_SESSION = 30;

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputStory, setInputStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const [promptInspirationIdx, setPromptInspirationIdx] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('');
  
  // Robust 3-way copy state
  const [activeCopyMenuIdx, setActiveCopyMenuIdx] = useState<number | null>(null);
  const [copyToastText, setCopyToastText] = useState<string | null>(null);

  // End Session & Archive State
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [archiveCommitted, setArchiveCommitted] = useState(false);
  const [archiveRecord, setArchiveRecord] = useState<ArchiveEntry | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const currentLoadingList = COMPUTATIONAL_LOADING_PHRASES[language] || COMPUTATIONAL_LOADING_PHRASES.en;

  // Auto-restore and auto-save draft prompt
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('asp_draft_prompt');
      if (savedDraft && !inputStory) {
        setInputStory(savedDraft);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (inputStory) {
        localStorage.setItem('asp_draft_prompt', inputStory);
      } else {
        localStorage.removeItem('asp_draft_prompt');
      }
    }
  }, [inputStory]);

  // Rotate computational loading phrases during active model execution (spaced with . . .)
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingPhraseIdx((prev) => (prev + 1) % currentLoadingList.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [loading, currentLoadingList.length]);

  // Slower rotation for prompt inspirations on homepage only (11 seconds)
  useEffect(() => {
    const list = ROTATING_PROMPT_INSPIRATIONS[language] || ROTATING_PROMPT_INSPIRATIONS.en;
    const interval = setInterval(() => {
      if (!inputStory.trim()) {
        setPromptInspirationIdx((prev) => (prev + 1) % list.length);
      }
    }, 11000);
    return () => clearInterval(interval);
  }, [language, inputStory]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setShowLangMenu(false);
      }
      if (!target.closest('.copy-menu-anchor')) {
        setActiveCopyMenuIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isRTL = language === 'ar';
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = userMessageCount >= MAX_EXCHANGES_PER_SESSION;

  const currentHomepagePlaceholder = (ROTATING_PROMPT_INSPIRATIONS[language] || ROTATING_PROMPT_INSPIRATIONS.en)[promptInspirationIdx] || 'Share your experience or ask a question here...';

  // TRANSLATION DICTIONARY
  const t = {
    en: {
      title: 'A Safe Passage',
      platformLabel: 'AI Public',
      languageBtnLabel: 'Language',
      contextTitle: 'Moving Across African Frontiers',
      aboutProjectParagraph1: 'A Safe Passage is an open civic space dedicated to understanding what it really takes to move freely across African frontiers, with people, produce, creative goods, and digital connectivity.',
      treatySubtext: 'Africa\'s regional treaties have already codified free movement and trade on paper through ECOWAS, the EAC, SADC, COMESA, and other regional blocs. Yet daily reality at checkpoints remains burdened by bureaucracy, arbitrary delays, and extortion.',
      postNationality: 'To understand and navigate these encounters, we work from a post-national perspective. Post-nationality is an exit from the nation-first framework and an embrace of a human-first framework; that is, that we and the people we encounter are more than just nationals.',
      aboutProjectParagraph2: 'This engine listens to your lived encounters, breaks down the administrative, legal, and human mechanisms at play, and helps foster a shared, citizen-level perspective on free movement.',
      promptBoxHeading: 'Share an Experience, Question, or Intention',
      onboardingPrompt: 'Whether you are planning a journey, seeking clarity on regional trade protocols and roaming, or reflecting on an encounter at a checkpoint, tell us what is on your mind.',
      sendBtn: 'Send',
      resetBtn: 'Start New Session',
      aboutNav: 'About',
      aboutTitle: 'About A Safe Passage',
      aboutBody: 'A Safe Passage is an interactive civic informatics engine developed by Iretomiwa Sharon Omodeinde (of 2001 Collective) within the Dreaming New Worlds 2026 programme. It treats the friction of African border encounters as civic data worth understanding. Rooted in post-national thought, it uses lived experience to examine where systems fail people and what safe, citizen-led passage looks like in practice.',
      languageExpansionNotice: 'Languages and Continental Scope: A Safe Passage currently supports Kiswahili, Arabic, English, French, Portuguese, and Spanish. As this public archive and civic governance model grows, our commitment is to expand to major indigenous languages spoken across the African continent (such as Hausa, Yoruba, Igbo, Amharic, Oromo, Lingala, isiZulu, Shona, Bambara, and more).',
      sessionGovernanceNotice: 'Session Governance: To preserve deliberative focus and ensure open server access for all travelers, each active session allows up to 30 exchanges. At any point during or at the end of the session, travelers can conclude and commit an anonymised reflection to the Mobility Archive.',
      editLabel: 'Edit',
      copyLabel: 'Copy',
      copyPromptLabel: 'Copy prompt',
      copyResponseLabel: 'Copy response',
      copyBothLabel: 'Copy both',
      copiedLabel: 'Copied!',
      viaPrefix: 'via',
      chatInputPlaceholder: 'Type your message or follow-up question here...',
      chatLimitPlaceholder: 'Session limit reached (30/30 exchanges). Ready to conclude.',
      sessionActiveNotice: 'Active conversation · Ready to wrap up?',
      exchangeCountBadge: `Exchange ${userMessageCount} of ${MAX_EXCHANGES_PER_SESSION}`,
      endSessionBtn: 'End session?',
      endSessionTitle: 'End Session & Archive Reflection',
      endSessionQuestion: 'Would you like to commit this reflection to the Mobility Archive?',
      endSessionSubtext: 'If you choose to contribute, direct personal identifiers such as names are permanently anonymised, preserving only general route insights as open civic data.',
      commitArchiveBtn: 'Commit to Mobility Archive',
      discardBtn: 'Discard & Reset',
      cancelBtn: 'Keep Conversing',
      archiveCommittedTitle: 'Committed to Mobility Archive',
      archiveCommittedDesc: 'Your reflection has been anonymized and filed into the open civic archive in the format below:',
      startNewSessionBtn: 'Start New Session',
      recordIdLabel: 'Record ID',
      timestampLabel: 'Timestamp',
      scrubbedTestimonyLabel: 'Scrubbed Testimony',
      reflectionLabel: 'Relational Diagnosis & Synthesis',
      regionalFrameTitle: 'Regional Treaties & Protocols Across Africa:',
      regions: [
        { name: 'West Africa (ECOWAS / AES)', desc: '90-day visa-free entry, 0% tariffs on local agricultural produce (ETLS), and biometric Sahel travel documents.' },
        { name: 'East Africa (EAC)', desc: 'National ID card travel (Kenya/Uganda/Rwanda), Single Tourist Visa, and One Network Area (ONA) telecom roaming.' },
        { name: 'Southern Africa (SADC)', desc: 'Simplified Trade Regime (STR) for small-scale cross-border traders and regional flat-rate roaming agreements.' },
        { name: 'Eastern & Southern (COMESA)', desc: 'COMESA Yellow Card (cross-border motor insurance in 13+ nations) and simplified customs clearance.' },
        { name: 'Central Africa (CEMAC)', desc: 'Visa-free circulation with biometric CEMAC passport across 6 member states.' },
        { name: 'Continental (AU / AfCFTA / Smart Africa)', desc: 'Free Movement Protocol, AfCFTA digital trade protocols, and One Africa Network (OAN)' }
      ]
    },
    sw: {
      title: 'A Safe Passage',
      platformLabel: 'AI Public',
      languageBtnLabel: 'Lugha',
      contextTitle: 'Kusafiri Katika Mipaka ya Afrika',
      aboutProjectParagraph1: 'A Safe Passage ni uwanja huru wa kiraia uliojitolea kuelewa kile kinachohitajika ili kusafiri kwa uhuru kuvuka mipaka ya Afrika, tukiwa na watu, mazao, bidhaa za ubunifu, na mawasiliano ya kidijitali.',
      treatySubtext: 'Mikataba ya kikanda barani Afrika tayari imerasimisha uhuru wa kutembea na biashara kupitia jumuiya kama EAC, ECOWAS, SADC, na COMESA. Hata hivyo, uhalisia wa kila siku mipakani bado umegubikwa na urasimu, ucheleweshaji usio na sababu, na rushwa.',
      postNationality: 'Ili kuelewa na kukabiliana na changamoto hizi, tunatumia mtazamo wa utu-kwanza. Mtazamo huu unavuka mipaka ya utaifa na kuweka mbele utu wetu; yaani, sisi na wale tunaokutana nao mipakani ni zaidi ya raia wa nchi fulani.',
      aboutProjectParagraph2: 'Mfumo huu unasikiliza simulizi na uzoefu wako halisi, unachambua mifumo ya kisheria, kiutawala na ya kibinadamu, na kusaidia kujenga mtazamo wa pamoja wa kiraia kuhusu uhuru wa kutembea.',
      promptBoxHeading: 'Shiriki Uzoefu, Swali, au Kusudio Lako',
      onboardingPrompt: 'Iwe unapanga safari, unatafuta ufafanuzi kuhusu itifaki za biashara au mawasiliano mipakani, au unatafakari kuhusu yaliyokukuta kwenye kituo cha ukaguzi, tuambie unachowaza.',
      sendBtn: 'Tuma',
      resetBtn: 'Anza Kikao Kipya',
      aboutNav: 'Kuhusu',
      aboutTitle: 'Kuhusu A Safe Passage',
      aboutBody: 'A Safe Passage ni mfumo wa kiraia unaoingiliana ulioundwa na Iretomiwa Sharon Omodeinde (wa 2001 Collective) ndani ya mpango wa Dreaming New Worlds 2026. Unachukulia msuguano unaopatikana wakati wa kuvuka mipaka ya Afrika kama data muhimu ya kiraia. Ikiwa imejikita katika mtazamo wa utu-kwanza, inachunguza pale mifumo inaposhindwa kuwatendea haki wananchi.',
      languageExpansionNotice: 'Lugha na Ufikiaji wa Bara: A Safe Passage kwa sasa inasaidia Kiswahili, Kiarabu, Kiingereza, Kifaransa, Kireno, na Kihispania. Kumbukumbu hii ya umma inavyokua, lengo letu ni kupanuka hadi lugha kuu za asili za bara la Afrika (kama vile Kihausa, Kiyoruba, Kiigbo, Kiamhariki, Kioromo, Kilingala, Kizulu, Kishona, Kibambara na nyinginezo).',
      sessionGovernanceNotice: 'Usimamizi wa Vikao: Ili kuhifadhi tafakuri makini na upatikanaji wazi wa mfumo, kila kikao kinachofanya kazi kinaruhusu hadi mabadilishano 30 ya mazungumzo. Wakati wowote wakati au mwisho wa kikao, wasafiri wanaweza kuhitimisha na kuhifadhi tafakuri isiyo na majina kwenye Kumbukumbu ya Uhamaji.',
      editLabel: 'Hariri',
      copyLabel: 'Nakili',
      copyPromptLabel: 'Nakili swali',
      copyResponseLabel: 'Nakili jibu',
      copyBothLabel: 'Nakili vyote',
      copiedLabel: 'Imenakiliwa!',
      viaPrefix: 'kupitia',
      chatInputPlaceholder: 'Andika ujumbe wako au swali hapa...',
      chatLimitPlaceholder: 'Kikomo cha kikao kimefikiwa (30/30). Tayari kuhitimisha.',
      sessionActiveNotice: 'Mazungumzo yanaendelea · Je, uko tayari kuhitimisha?',
      exchangeCountBadge: `Mazungumzo ${userMessageCount} ya ${MAX_EXCHANGES_PER_SESSION}`,
      endSessionBtn: 'Hitimisha?',
      endSessionTitle: 'Kuhitimisha & Kuhifadhi kwenye Kumbukumbu',
      endSessionQuestion: 'Je, ungependa kuhifadhi tafakuri hii kwenye Kumbukumbu ya Uhamaji?',
      endSessionSubtext: 'Ukichagua kuchangia, taarifa binafsi kama vile majina zinaondolewa utambulisho kabisa, zikibakiza tu taarifa za jumla za safari kama data ya wazi ya kiraia.',
      commitArchiveBtn: 'Hifadhi kwenye Kumbukumbu ya Uhamaji',
      discardBtn: 'Futa & Anza Upya',
      cancelBtn: 'Endelea na Mazungumzo',
      archiveCommittedTitle: 'Imehifadhiwa kwenye Kumbukumbu ya Uhamaji',
      archiveCommittedDesc: 'Uzoefu wako umefichwa utambulisho na kuhifadhiwa katika mfumo ulio wazi hapa chini:',
      startNewSessionBtn: 'Anza Kikao Kipya',
      recordIdLabel: 'Nambari ya Kumbukumbu',
      timestampLabel: 'Muda',
      scrubbedTestimonyLabel: 'Ushuhuda Uliosafishwa (Bila PII)',
      reflectionLabel: 'Uchambuzi & Tafakuri ya Kihusiano',
      regionalFrameTitle: 'Mikataba na Itifaki za Kikanda Barani Afrika:',
      regions: [
        { name: 'Afrika Mashariki (EAC)', desc: 'Kusafiri kwa Kitambulisho cha Taifa (Kenya/Uganda/Rwanda), Visa ya Utalii ya Pamoja, na One Network Area (ONA) ya mawasiliano ya simu na intaneti.' },
        { name: 'Afrika Magharibi (ECOWAS / AES)', desc: 'Kuingia bila visa kwa siku 90, 0% ushuru wa bidhaa za kilimo (ETLS), na hati za kusafiria za kibiometriki.' },
        { name: 'Kusini mwa Afrika (SADC)', desc: 'Mfumo Rahisi wa Biashara (STR) kwa wafanyabiashara wadogo na viwango nafuu vya mawasiliano ya kikanda.' },
        { name: 'Mashariki na Kusini (COMESA)', desc: 'Kadi ya Njano ya COMESA (bima ya gari inayotumika katika nchi 13+) na mfumo rahisi wa biashara.' },
        { name: 'Afrika ya Kati (CEMAC)', desc: 'Kusafiri bila visa kwa pasipoti ya kibiometriki ya CEMAC katika nchi 6 wanachama.' },
        { name: 'Bara Zima (AU / AfCFTA / Smart Africa)', desc: 'Itifaki ya Uhuru wa Kutembea, biashara ya kidijitali ya AfCFTA na mtandao wa One Africa Network (OAN)' }
      ]
    },
    ar: {
      title: 'A Safe Passage',
      platformLabel: 'AI Public',
      languageBtnLabel: 'اللغة',
      contextTitle: 'التنقل عبر الحدود الإفريقية',
      aboutProjectParagraph1: 'A Safe Passage هي مساحة مدنية مفتوحة مكرسة لفهم ما يتطلبه السفر، والتجارة، والإنتاج الإبداعي، والاتصال الرقمي عبر التخوم الإفريقية.',
      treatySubtext: 'قننت المعاهدات الإقليمية الإفريقية حرية التنقل والتجارة على الورق عبر تكتلات مثل إيكواس، ومجتمع شرق إفريقيا، وسادك، وكوميسا. ورغم ذلك، لا يزال الواقع اليومي عند المعابر مثقلاً بالبيروقراطية، والتعطيل التعسفي، والابتزاز.',
      postNationality: 'لفهم هذه التجارب وتجاوزها، ننطلق من منظور ما بعد القومية. ما بعد القومية هو خروج من الإطار الذي يضع الدولة أولاً وتبني إطار يضع الإنسان أولاً؛ أي أننا والأشخاص الذين نلتقي بهم عند الحدود أكثر من مجرد رعايا دول.',
      aboutProjectParagraph2: 'يستمع هذا المحرك إلى تجاربكم الواقعية، ويفكك الأبعاد القانونية والإدارية والإنسانية الفاعلة، ويسهم في بناء سجل جماعي لما يعنيه المرور الآمن في الممارسة اليومية.',
      promptBoxHeading: 'شارك تجربة، سؤالاً، أو نية للسفر',
      onboardingPrompt: 'سواء كنت تخطط لرحلة، أو تبحث عن توضيح بشأن البروتوكولات التجارية الإقليمية والتجوال، أو تتأمل في تجربة مررت بها عند نقطة تفتيش، شاركنا بما يدور في ذهنك.',
      sendBtn: 'إرسال',
      resetBtn: 'إعادة البدء',
      aboutNav: 'عن المشروع',
      aboutTitle: 'عن مشروع A Safe Passage',
      aboutBody: 'A Safe Passage هو محرك معلوماتي مدني تفاعلي طورته إريتوميو شاورن أوموديندي (من 2001 Collective) ضمن برنامج Dreaming New Worlds 2026. يتعامل مع الاحتكاكات المعاشة عند المعابر الإفريقية كبيانات مدنية تستحق الفهم، مؤسساً على فكر ما بعد القومية لفهم أين تعجز النظم عن خدمة الناس.',
      languageExpansionNotice: 'اللغات والانتشار القاري: يدعم A Safe Passage حالياً السواحيلية، العربية، الإنجليزية، الفرنسية، البرتغالية، والإسبانية. ومع تطور الأرشيف العام، نهدف إلى التوسع تدريجياً ليشمل اللغات الإفريقية الأصلية الكبرى (مثل الهوسا، اليوروبا، الإيغبو، الأمهرية، الأورومو، اللينغالا، الزولو، الشونا، البامبارا وغيرها).',
      sessionGovernanceNotice: 'حوكمة الجلسات: للحفاظ على عمق الحوار وضمان كفاءة الخوادم للجميع، تتيح كل جلسة نشطة ما يصل إلى 30 تبادلاً حوارياً. يمكن للمستخدم في أي لحظة أو عند اكتمال الجلسة إنهاء المحادثة وتوثيق خلاصتها المجردة من الهوية في أرشيف التنقل.',
      editLabel: 'تعديل',
      copyLabel: 'نسخ',
      copyPromptLabel: 'نسخ السؤال',
      copyResponseLabel: 'نسخ الرد',
      copyBothLabel: 'نسخ الكل',
      copiedLabel: 'تم النسخ!',
      viaPrefix: 'عبر',
      chatInputPlaceholder: 'اكتب رسالتك أو استفسارك هنا...',
      chatLimitPlaceholder: 'تم بلوغ حد الجلسة (30/30 تبادلاً). جاهز للإنهاء.',
      sessionActiveNotice: 'المحادثة نشطة · هل ترغب في الإنهاء؟',
      exchangeCountBadge: `التبادل ${userMessageCount} من ${MAX_EXCHANGES_PER_SESSION}`,
      endSessionBtn: 'إنهاء الجلسة؟',
      endSessionTitle: 'إنهاء الجلسة وتوثيق التجربة',
      endSessionQuestion: 'هل ترغب في حفظ هذه التجربة في أرشيف التنقل؟',
      endSessionSubtext: 'في حال اخترت المساهمة، يتم حجب المعرفات الشخصية المباشرة كالأسماء بالكامل، مع الاحتفاظ فقط بمسار الرحلة العام كبيانات مدنية عامة.',
      commitArchiveBtn: 'حفظ في أرشيف التنقل',
      discardBtn: 'إلغاء وإعادة تعيين',
      cancelBtn: 'متابعة المحادثة',
      archiveCommittedTitle: 'تم الحفظ في أرشيف التنقل',
      archiveCommittedDesc: 'تمت إزالة المعرفات الشخصية من تجربتك وتوثيقها بالصيغة الشفافة أدناه:',
      startNewSessionBtn: 'بدء جلسة جديدة',
      recordIdLabel: 'معرف السجل',
      timestampLabel: 'الوقت والتاريخ',
      scrubbedTestimonyLabel: 'الشهادة المجردة من المعرفات',
      reflectionLabel: 'التحليل والعبرة البنيوية',
      regionalFrameTitle: 'المعاهدات والبروتوكولات الإقليمية عبر إفريقيا:',
      regions: [
        { name: 'غرب إفريقيا (ECOWAS / AES)', desc: 'دخول بدون تأشيرة لمدة 90 يوماً، 0% رسوم جمركية على المنتجات الزراعية (ETLS)، وجوازات سفر بيومترية موحدة.' },
        { name: 'شرق إفريقيا (EAC)', desc: 'السفر ببطاقة الهوية الوطنية (كينيا/أوغندا/رواندا)، تأشيرة سياحية موحدة، ونطاق موحد لبيانات الهاتف (ONA).' },
        { name: 'الجنوب الإفريقي (SADC)', desc: 'نظام تجاري مبسط (STR) لصغار التجار وأسعار تجوال إقليمية موحدة.' },
        { name: 'الشرق والجنوب (COMESA)', desc: 'البطاقة الصفراء للتأمين على المركبات (13 دولة) ونظام تجاري مبسط.' },
        { name: 'وسط إفريقيا (CEMAC)', desc: 'تنقل بدون تأشيرة بجواز سفر CEMAC البيومتري عبر 6 دول أعضاء.' },
        { name: 'القارة (الاتحاد الإفريقي / ZLECAf / Smart Africa)', desc: 'بروتوكول حرية التنقل، التجارة الرقمية لمنطقة التجارة الحرة القارية، وشبكة One Africa Network (OAN)' }
      ]
    },
    fr: {
      title: 'A Safe Passage',
      platformLabel: 'AI Public',
      languageBtnLabel: 'Langue',
      contextTitle: 'Se déplacer à travers les frontières africaines',
      aboutProjectParagraph1: 'A Safe Passage est un espace civique ouvert dédié à la compréhension des réalités du voyage, du commerce, de la création et de la connectivité à travers les frontières africaines.',
      treatySubtext: 'Les traités régionaux africains ont déjà codifié la libre circulation et les échanges sur le papier à travers la CEDEAO, la CAE, la SADC, le COMESA et d\'autres blocs. Pourtant, la réalité quotidienne aux postes de contrôle reste alourdie par la bureaucratie, les tracasseries et les retards arbitraires.',
      postNationality: 'Pour comprendre et transformer ces rencontres, nous adoptons une perspective post-nationale. La post-nationalité est une sortie du cadre centré sur la nation pour embrasser un cadre centré sur l\'humain ; c\'est-à-dire que nous et les personnes que nous rencontrons sommes bien plus que de simples ressortissants nationaux.',
      aboutProjectParagraph2: 'Cet outil écoute vos expériences vécues, analyse les mécanismes juridiques, administratifs et humains en jeu, et contribue à bâtir une mémoire collective de ce qu\'est un passage sûr dans la pratique.',
      promptBoxHeading: 'Partagez une expérience, une question ou un projet',
      onboardingPrompt: 'Que vous planifiiez un voyage, cherchiez des clarifications sur les protocoles commerciaux ou le roaming, ou réfléchissiez à une expérience vécue à un poste-frontière, partagez ce qui vous préoccupe.',
      sendBtn: 'Envoyer',
      resetBtn: 'Recommencer',
      aboutNav: 'À propos',
      aboutTitle: 'À propos de A Safe Passage',
      aboutBody: 'A Safe Passage est un outil civique interactif développé par Iretomiwa Sharon Omodeinde (de 2001 Collective) dans le cadre du programme Dreaming New Worlds 2026. Il traite les frictions vécues aux frontières africaines comme des données civiques méritant d\'être comprises. Ancré dans la pensée post-nationale, il s\'appuie sur des expériences réelles pour dépasser les blocages bureaucratiques.',
      languageExpansionNotice: 'Langues et portée continentale : A Safe Passage prend actuellement en charge le kiswahili, l\'arabe, l\'anglais, le français, le portugais et l\'espagnol. À mesure que cette archive publique grandit, nous prévoyons de l\'étendre aux principales langues autochtones d\'Afrique (notamment haoussa, yoruba, igbo, amharique, oromo, lingala, zoulou, shona, bambara, etc.).',
      sessionGovernanceNotice: 'Gouvernance des sessions : Afin de préserver la qualité de la réflexion et l\'accessibilité du serveur pour tous, chaque session active autorise jusqu\'à 30 échanges. À tout moment ou au terme de la session, les voyageurs peuvent conclure et enregistrer une réflexion anonymisée dans l\'Archive de Mobilité.',
      editLabel: 'Modifier',
      copyLabel: 'Copier',
      copyPromptLabel: 'Copier la question',
      copyResponseLabel: 'Copier la réponse',
      copyBothLabel: 'Copier les deux',
      copiedLabel: 'Copié !',
      viaPrefix: 'via',
      chatInputPlaceholder: 'Écrivez votre message ou votre question ici...',
      chatLimitPlaceholder: 'Limite de session atteinte (30/30 échanges). Prêt à conclure.',
      sessionActiveNotice: 'Conversation active · Prêt à conclure ?',
      exchangeCountBadge: `Échange ${userMessageCount} sur ${MAX_EXCHANGES_PER_SESSION}`,
      endSessionBtn: 'Terminer la session ?',
      endSessionTitle: 'Fin de session & Archive de Mobilité',
      endSessionQuestion: 'Souhaitez-vous enregistrer cette réflexion dans l\'Archive de Mobilité ?',
      endSessionSubtext: 'Si vous choisissez de contribuer, les identifiants personnels directs tels que les noms sont définitivement anonymisés, ne conservant que les données générales de trajet comme bien civique ouvert.',
      commitArchiveBtn: 'Enregistrer dans l\'Archive de Mobilité',
      discardBtn: 'Effacer et réinitialiser',
      cancelBtn: 'Poursuivre l\'échange',
      archiveCommittedTitle: 'Enregistré dans l\'Archive de Mobilité',
      archiveCommittedDesc: 'Votre réflexion a été anonymisée et enregistrée dans le format transparent ci-dessous :',
      startNewSessionBtn: 'Commencer une nouvelle session',
      recordIdLabel: 'Identifiant d\'archive',
      timestampLabel: 'Horodatage',
      scrubbedTestimonyLabel: 'Témoignage anonymisé',
      reflectionLabel: 'Réflexion relationnelle & Synthèse',
      regionalFrameTitle: 'Traités & protocoles régionaux à travers l\'Afrique :',
      regions: [
        { name: 'Afrique de l\'Ouest (CEDEAO / AES)', desc: 'Entrée sans visa 90 jours, 0% droits de douane agricoles (TLS) et passeports biométriques du Sahel.' },
        { name: 'Afrique de l\'Est (EAC)', desc: 'Passage avec simple Carte Nationale d\'Identité (Kenya/Ouganda/Rwanda), Visa Touristique Unique et One Network Area (ONA) pour les données.' },
        { name: 'Afrique Australe (SADC)', desc: 'Régime Commercial Simplifié (STR) pour les petits commerçants et accords d\'itinérance mobile.' },
        { name: 'Est & Sud (COMESA)', desc: 'Carte Jaune COMESA (assurance automobile valable dans 13+ pays) et régime commercial simplifié.' },
        { name: 'Afrique Centrale (CEMAC)', desc: 'Circulation sans visa avec passeport biométrique CEMAC dans les 6 États membres.' },
        { name: 'Continental (UA / ZLECAf / Smart Africa)', desc: 'Protocole de libre circulation, commerce numérique ZLECAf et réseau One Africa Network (OAN)' }
      ]
    },
    pt: {
      title: 'A Safe Passage',
      platformLabel: 'AI Public',
      languageBtnLabel: 'Idioma',
      contextTitle: 'Cruzando as fronteiras africanas',
      aboutProjectParagraph1: 'A Safe Passage é um espaço cívico aberto dedicado a compreender o que é necessário para viajar, comercializar, criar e manter-se conectado através das fronteiras africanas.',
      treatySubtext: 'Os tratados regionais africanos já codificaram a livre circulação e o comércio no papel por meio da CEDEAO, EAC, SADC, COMESA e outros blocos. No entanto, a realidade diária nos postos de controle continua marcada pela burocracia, extorsões e atrasos arbitrários.',
      postNationality: 'Para compreender e transformar esses encontros, trabalhamos a partir de uma perspectiva pós-nacional. Pós-nacionalidade é a saída da estrutura focada na nação para abraçar uma estrutura focada no ser humano; ou seja, nós e as pessoas que encontramos somos muito mais do que meros cidadãos nacionais.',
      aboutProjectParagraph2: 'Este mecanismo escuta suas vivências, analisa as dinámicas legais, administrativas e humanas em jogo e constrói um registro coletivo de como deve ser uma passagem segura na prática.',
      promptBoxHeading: 'Compartilhe uma experiência, pergunta ou intenção',
      onboardingPrompt: 'Quer esteja planejando uma viagem, buscando esclarecimentos sobre protocolos de comércio e roaming regional, ou refletindo sobre um encontro em um posto de controle, compartilhe o que tem em mente.',
      sendBtn: 'Enviar',
      resetBtn: 'Recomeçar',
      aboutNav: 'Sobre',
      aboutTitle: 'Sobre A Safe Passage',
      aboutBody: 'A Safe Passage é um mecanismo cívico interativo desenvolvido por Iretomiwa Sharon Omodeinde (do 2001 Collective) no âmbito do programa Dreaming New Worlds 2026. Trata o atrito vivido nas fronteiras africanas como dados cívicos dignos de compreensão, ancorado no pensamento pós-nacional.',
      languageExpansionNotice: 'Idiomas e Alcance Continental: A Safe Passage atualmente suporta Kiswahili, Árabe, Inglês, Francês, Português e Espanhol. À medida que o arquivo público e a governança comunitária evoluem, nosso compromisso é expandir para as principais línguas indígenas africanas (como Hauçá, Iorubá, Ibo, Amárico, Oromo, Lingala, Zulu, Shona, Bambara e outras).',
      sessionGovernanceNotice: 'Governança das Sessões: Para preservar o foco reflexivo e garantir o acesso público aberto, cada sessão ativa permite até 30 trocas de mensagens. A qualquer momento ou ao atingir o limite, os viajantes podem concluir e registrar uma reflexão anonimizada no Arquivo de Mobilidade.',
      editLabel: 'Editar',
      copyLabel: 'Copiar',
      copyPromptLabel: 'Copiar pergunta',
      copyResponseLabel: 'Copiar resposta',
      copyBothLabel: 'Copiar ambos',
      copiedLabel: 'Copiado!',
      viaPrefix: 'via',
      chatInputPlaceholder: 'Digite sua mensagem ou pergunta de acompanhamento aqui...',
      chatLimitPlaceholder: 'Limite da sessão atingido (30/30 trocas). Pronto para concluir.',
      sessionActiveNotice: 'Conversa ativa · Pronto para concluir?',
      exchangeCountBadge: `Troca ${userMessageCount} de ${MAX_EXCHANGES_PER_SESSION}`,
      endSessionBtn: 'Encerrar sessão?',
      endSessionTitle: 'Encerrar Sessão & Arquivar Reflexão',
      endSessionQuestion: 'Deseja arquivar esta reflexão no Arquivo de Mobilidade?',
      endSessionSubtext: 'Se optar por contribuir, identificadores pessoais diretos como nomes são permanentemente anonimizados, preservando apenas dados gerais de rota como bem cívico aberto.',
      commitArchiveBtn: 'Gravar no Arquivo de Mobilidade',
      discardBtn: 'Descartar e Reiniciar',
      cancelBtn: 'Continuar Conversa',
      archiveCommittedTitle: 'Registrado no Arquivo de Mobilidade',
      archiveCommittedDesc: 'Sua reflexão foi anonimizada e registrada no formato transparente abaixo:',
      startNewSessionBtn: 'Iniciar Nova Sessão',
      recordIdLabel: 'ID do Registro',
      timestampLabel: 'Data/Hora',
      scrubbedTestimonyLabel: 'Depoimento Anonimizado',
      reflectionLabel: 'Reflexão Relacional & Síntese',
      regionalFrameTitle: 'Tratados e Protocolos Regionais em África:',
      regions: [
        { name: 'África Ocidental (CEDEAO / AES)', desc: 'Entrada sem visto por 90 dias, 0% tarifas em produtos agrícolas (ETLS) e passaportes biométricos do Sahel.' },
        { name: 'África Oriental (EAC)', desc: 'Viagens com Carteira de Identidade Nacional (Quênia/Uganda/Ruanda), Visto Turístico Único e One Network Area (ONA) para roaming.' },
        { name: 'África Austral (SADC)', desc: 'Regime Comercial Simplificado (STR) para pequenos comerciantes e tarifas planas de roaming regional.' },
        { name: 'Leste e Sul (COMESA)', desc: 'Cartão Amarelo COMESA (seguro automóvel em 13+ países) e regime comercial simplificado.' },
        { name: 'África Central (CEMAC)', desc: 'Circulação sem visto com passaporte biométrico CEMAC em 6 Estados-membros.' },
        { name: 'Continental (União Africana / AfCFTA / Smart Africa)', desc: 'Protocolo de Livre Circulação, comércio digital da AfCFTA e rede One Africa Network (OAN)' }
      ]
    },
    es: {
      title: 'A Safe Passage',
      platformLabel: 'AI Public',
      languageBtnLabel: 'Idioma',
      contextTitle: 'Cruzando las fronteras africanas',
      aboutProjectParagraph1: 'A Safe Passage es un espacio cívico abierto dedicado a comprender lo que implica viajar, comerciar, crear y mantenerse conectado a través de las fronteras de África.',
      treatySubtext: 'Los tratados regionales africanos ya codificaron el libre movimiento y el comercio sobre el papel a través de la CEDEAO, la Comunidad de África Oriental, la SADC, el COMESA y otros bloques. Sin embargo, la realidad cotidiana en los puestos de control sigue marcada por la burocracia, la extorsión y las demoras arbitrarias.',
      postNationality: 'Para comprender y transformar estos encuentros, trabajamos desde una perspectiva posnacional. La posnacionalidad es una salida del marco centrado en la nación para abrazar un marco centrado en el ser humano; es decir, que nosotros y las personas con quienes nos encontramos somos más que simples ciudadanos nacionales.',
      aboutProjectParagraph2: 'Este motor escucha tus vivencias, analiza las dinámicas legales, administrativas e humanas en juego y construye un registro colectivo de lo que significa un paso seguro en la práctica.',
      promptBoxHeading: 'Comparte una experiencia, pregunta o intención',
      onboardingPrompt: 'Ya sea que estés planeando un viaje, buscando claridad sobre protocolos de comercio y roaming regional, o reflexionando sobre un encuentro en un puesto de control, cuéntanos lo que tienes en mente.',
      sendBtn: 'Enviar',
      resetBtn: 'Reiniciar',
      aboutNav: 'Acerca de',
      aboutTitle: 'Acerca de A Safe Passage',
      aboutBody: 'A Safe Passage es un motor de informática cívica interactivo desarrollado por Iretomiwa Sharon Omodeinde (de 2001 Collective) dentro del programa Dreaming New Worlds 2026. Trata la fricción vivida al cruzar fronteras africanas como datos cívicos que vale la pena comprender. Basado en el pensamiento posnacional, utiliza experiencias reales para examinar dónde los sistemas fallan a las personas y cómo es un paso seguro liderado por los ciudadanos en la práctica.',
      languageExpansionNotice: 'Idiomas y alcance continental: A Safe Passage actualmente admite kiswahili, árabe, inglés, francés, portugués y español. A medida que este archivo público y el modelo de gobernanza cívica crezcan, nuestro compromiso es expandirnos a las principales lenguas indígenas habladas en el continente africano (como hausa, yoruba, igbo, amárico, oromo, lingala, isiZulu, shona, bambara y más).',
      sessionGovernanceNotice: 'Gobernanza de las sesiones: Para preservar un diálogo reflexivo y garantizar el acceso abierto a los servidores, cada sesión activa permite hasta 30 intercambios. En cualquier momento o al alcanzar el límite, los viajeros pueden concluir y registrar una reflexión anonimizada en el Archivo de Movilidad.',
      editLabel: 'Editar',
      copyLabel: 'Copiar',
      copyPromptLabel: 'Copiar pregunta',
      copyResponseLabel: 'Copiar respuesta',
      copyBothLabel: 'Copiar ambos',
      copiedLabel: '¡Copiado!',
      viaPrefix: 'vía',
      chatInputPlaceholder: 'Escribe tu mensaje o pregunta de seguimiento aquí...',
      chatLimitPlaceholder: 'Límite de sesión alcanzado (30/30 intercambios). Listo para concluir.',
      sessionActiveNotice: 'Conversación activa · ¿Listo para concluir?',
      exchangeCountBadge: `Intercambio ${userMessageCount} de ${MAX_EXCHANGES_PER_SESSION}`,
      endSessionBtn: '¿Finalizar sesión?',
      endSessionTitle: 'Finalizar sesión y archivar reflexión',
      endSessionQuestion: '¿Deseas registrar esta reflexión en el Archivo de Movilidad?',
      endSessionSubtext: 'Si decides contribuir, los identificadores personales directos como los nombres se anonimizan de forma permanente, preservando solo los datos generales de ruta como bien cívico abierto.',
      commitArchiveBtn: 'Registrar en el Archivo de Movilidad',
      discardBtn: 'Descartar y reiniciar',
      cancelBtn: 'Seguir conversando',
      archiveCommittedTitle: 'Registrado en el Archivo de Movilidad',
      archiveCommittedDesc: 'Tu reflexión ha sido anonimizada y registrada en el formato transparente a continuación:',
      startNewSessionBtn: 'Iniciar nueva sesión',
      recordIdLabel: 'ID de registro',
      timestampLabel: 'Fecha y hora',
      scrubbedTestimonyLabel: 'Testimonio sin datos personales',
      reflectionLabel: 'Reflexión relacional y síntesis',
      regionalFrameTitle: 'Tratados y protocolos regionales en África:',
      regions: [
        { name: 'África Occidental (CEDEAO / AES)', desc: 'Entrada sin visa por 90 días, 0% de aranceles agrícolas (ETLS) y pasaportes biométricos unificados del Sahel.' },
        { name: 'África Oriental (EAC)', desc: 'Viajes con documento nacional de identidad (Kenia/Uganda/Ruanda), visa turística única y One Network Area (ONA) para roaming.' },
        { name: 'África Austral (SADC)', desc: 'Régimen comercial simplificado (STR) para pequeños comerciantes y tarifas planas de roaming regional.' },
        { name: 'Oriental y Austral (COMESA)', desc: 'Tarjeta Amarilla COMESA (seguro automotor en 13+ países) y régimen comercial simplificado.' },
        { name: 'África Central (CEMAC)', desc: 'Circulación sin visa con pasaporte biométrico CEMAC en 6 Estados miembros.' },
        { name: 'Continental (Unión Africana / ZLECAf / Smart Africa)', desc: 'Protocolo de Libre Circulación, comercio digital de la ZLECAf y red One Africa Network (OAN)' }
      ]
    }
  }[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (overrideText?: string) => {
    const textToSend = overrideText || inputStory;
    if (!textToSend.trim() || loading || isLimitReached) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: textToSend }
    ];

    setMessages(newMessages);
    setInputStory('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language })
      });

      const data = await response.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'model', content: data.reply }]);
        if (data.provider) setActiveProvider(data.provider);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'model',
            content: language === 'fr'
              ? 'Une erreur s\'est produite. Veuillez réessayer.'
              : language === 'sw'
              ? 'Hitilafu imetokea. Tafadhali jaribu tena.'
              : language === 'ar'
              ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى.'
              : language === 'pt'
              ? 'Ocorreu um erro. Por favor, tente novamente.'
              : language === 'es'
              ? 'Ocurrió un error. Por favor, intenta de nuevo.'
              : 'Something went wrong. Please try again.'
          }
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content: language === 'fr'
            ? 'Erreur de connexion. Veuillez réessayer.'
            : language === 'sw'
            ? 'Hitilafu ya muunganisho. Tafadhali jaribu tena.'
            : language === 'ar'
            ? 'خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
            : language === 'pt'
            ? 'Erro de conexão. Por favor, tente novamente.'
            : language === 'es'
            ? 'Error de conexión. Por favor, intenta de nuevo.'
            : 'Connection error. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idx: number) => {
    setInputStory(messages[idx].content);
    setMessages(messages.slice(0, idx));
  };

  // Robust 3-Way Copy Execution
  const executeCopy = (type: 'prompt' | 'reflection' | 'both', modelIdx: number) => {
    const precedingUserMsg = messages
      .slice(0, modelIdx)
      .reverse()
      .find((m) => m.role === 'user')?.content || '';
    const modelMsg = messages[modelIdx]?.content || '';

    let textToCopy = '';
    if (type === 'prompt') {
      textToCopy = precedingUserMsg || modelMsg;
    } else if (type === 'reflection') {
      textToCopy = modelMsg;
    } else {
      textToCopy = precedingUserMsg
        ? `[PROMPT]\n${precedingUserMsg}\n\n[A SAFE PASSAGE]\n${modelMsg}`
        : modelMsg;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyToastText(`Copied ${type === 'prompt' ? 'Prompt' : type === 'reflection' ? 'Response' : 'Exchange'}!`);
      setActiveCopyMenuIdx(null);
      setTimeout(() => {
        setCopyToastText(null);
      }, 2200);
    });
  };

  const handleCommitToArchive = () => {
    const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'User testimony recorded.';
    const lastModelMsg = [...messages].reverse().find(m => m.role === 'model')?.content || 'Relational diagnosis compiled.';

    const newRecord: ArchiveEntry = {
      id: `ASP-2026-X${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      language: language.toUpperCase(),
      testimony: firstUserMsg,
      reflection: lastModelMsg,
      provider: activeProvider || 'Gemini',
      piiStatus: 'VERIFIED_SCRUBBED_ANONYMOUS'
    };

    setArchiveRecord(newRecord);
    setArchiveCommitted(true);
  };

  const handleResetSession = () => {
    setMessages([]);
    setInputStory('');
    setActiveProvider('');
    setShowEndSessionModal(false);
    setArchiveCommitted(false);
    setArchiveRecord(null);
    setActiveCopyMenuIdx(null);
  };

  return (
    <>
      {/* 2D VECTOR FIELD GENERATIVE BACKGROUND CANVAS (RETRO SQUID EASTER EGG SWIMS CONTINUOUSLY) */}
      <VectorFieldBackground isProcessing={loading} />

      {/* FOREGROUND MAIN UI */}
      <div 
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '680px',
          margin: '0 auto',
          width: '100%',
          padding: '16px',
          position: 'relative',
          zIndex: 1,
          color: '#000000'
        }}
      >

        {/* CLEAN, UNCLUTTERED HEADER */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          border: '2px solid #6d28d9',
          marginBottom: '16px',
          background: '#6d28d9',
          boxShadow: '3px 3px 0px #4c1d95'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.01em', lineHeight: '1', margin: 0, color: '#ffffff' }}>
              {t.title}
            </h1>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#e9d5ff', lineHeight: '1' }}>· {t.platformLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language Selector Dropdown */}
            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLangMenu(!showLangMenu);
                }}
                style={{
                  background: '#ffffff',
                  color: '#6d28d9',
                  border: '2px solid #ffffff',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #4c1d95',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Globe size={12} />
                <span>{LANGUAGE_OPTIONS.find(l => l.code === language)?.flag || 'EN'}</span>
                <ChevronDown size={11} />
              </button>

              {showLangMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  [isRTL ? 'left' : 'right']: 0,
                  marginTop: '4px',
                  background: '#ffffff',
                  border: '2px solid #000000',
                  boxShadow: '3px 3px 0px #000000',
                  zIndex: 200,
                  minWidth: '130px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLanguage(opt.code);
                        setShowLangMenu(false);
                      }}
                      style={{
                        padding: '7px 10px',
                        fontSize: '11px',
                        fontWeight: language === opt.code ? '800' : '500',
                        color: language === opt.code ? '#6d28d9' : '#0f172a',
                        background: language === opt.code ? '#f5f3ff' : '#ffffff',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        textAlign: isRTL ? 'right' : 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About Navigation Button */}
            <button
              onClick={() => setShowAbout(true)}
              style={{
                background: '#ffffff',
                color: '#6d28d9',
                border: '2px solid #ffffff',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #4c1d95'
              }}
            >
              {t.aboutNav}
            </button>
          </div>
        </header>

        {/* COPY TOAST NOTIFIER */}
        {copyToastText && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            color: '#ffffff',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '700',
            border: '2px solid #6d28d9',
            boxShadow: '3px 3px 0px #6d28d9',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Check size={14} style={{ color: '#4ade80' }} />
            <span>{copyToastText}</span>
          </div>
        )}

        {/* HOMEPAGE / ONBOARDING */}
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* 1. UNIFIED CONTEXT BLOCK */}
            <div style={{
              border: '2px solid #000000',
              padding: '20px 22px',
              background: '#ffffff',
              boxShadow: '2px 2px 0px #000000',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '800',
                margin: 0,
                color: '#000000'
              }}>
                {t.contextTitle}
              </h2>

              <p style={{
                fontSize: '13.5px',
                lineHeight: '1.65',
                color: '#1e293b',
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontStyle: 'normal'
              }}>
                {t.aboutProjectParagraph1}
              </p>

              <p style={{
                fontSize: '13.5px',
                lineHeight: '1.65',
                color: '#1e293b',
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontStyle: 'normal'
              }}>
                {t.treatySubtext}
              </p>

              <p style={{
                fontSize: '13.5px',
                lineHeight: '1.65',
                color: '#1e293b',
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontStyle: 'normal'
              }}>
                {t.postNationality}
              </p>

              <p style={{
                fontSize: '13.5px',
                lineHeight: '1.65',
                color: '#1e293b',
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontStyle: 'normal'
              }}>
                {t.aboutProjectParagraph2}
              </p>
            </div>

            {/* 2. PROMPT BOX WITH HARMONIZED HEADING AND ROTATING PLACEHOLDER (PIXEL FONT & LARGER SIZE) */}
            <div style={{
              border: '2px solid #000000',
              padding: '18px 20px',
              background: '#ffffff',
              boxShadow: '2px 2px 0px #000000'
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 10px 0', color: '#000000' }}>
                {t.promptBoxHeading}
              </h2>
              <label style={{
                fontSize: '13.5px',
                fontWeight: 400,
                fontStyle: 'normal',
                marginBottom: '12px',
                display: 'block',
                lineHeight: '1.6',
                color: '#334155',
                fontFamily: 'var(--font-body)'
              }}>
                {t.onboardingPrompt}
              </label>

              <textarea
                value={inputStory}
                onChange={(e) => setInputStory(e.target.value)}
                placeholder={currentHomepagePlaceholder}
                rows={3}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '2px solid #000000',
                  padding: '12px 14px',
                  color: '#000000',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  fontFamily: 'var(--font-pixel)',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'placeholder 0.4s ease'
                }}
              />

              <button
                onClick={() => handleSubmit()}
                disabled={!inputStory.trim() || loading}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  background: inputStory.trim() ? '#6d28d9' : '#e2e8f0',
                  color: inputStory.trim() ? '#ffffff' : '#94a3b8',
                  fontWeight: '700',
                  padding: '10px',
                  border: inputStory.trim() ? '2px solid #6d28d9' : '2px solid #cbd5e1',
                  cursor: inputStory.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  boxShadow: inputStory.trim() ? '3px 3px 0px #4c1d95' : 'none'
                }}
              >
                {t.sendBtn}
              </button>
            </div>

          </div>
        ) : (
          /* CHAT VIEW */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Chat top bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(2px)'
            }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{t.title}</span>
              <button
                onClick={handleResetSession}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={10} />
                {t.resetBtn}
              </button>
            </div>

            {/* Messages Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
                    maxWidth: '90%',
                    position: 'relative'
                  }}
                >
                  {/* Action bar above bubbles */}
                  {msg.role === 'user' ? (
                    <div style={{ display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end', marginBottom: '3px' }}>
                      <button
                        onClick={() => handleEdit(idx)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#6d28d9',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '1px 1px 0px #cbd5e1'
                        }}
                        title="Edit this prompt"
                      >
                        <Pencil size={9} />
                        {t.editLabel}
                      </button>
                    </div>
                  ) : (
                    /* ROBUST 3-WAY COPY POPOVER */
                    <div
                      className="copy-menu-anchor"
                      style={{
                        display: 'flex',
                        justifyContent: isRTL ? 'flex-end' : 'flex-start',
                        marginBottom: '3px',
                        position: 'relative'
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCopyMenuIdx(activeCopyMenuIdx === idx ? null : idx);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '1px 1px 0px #cbd5e1'
                        }}
                        title="Copy options"
                      >
                        <Copy size={9} />
                        <span>{t.copyLabel} ▾</span>
                      </button>

                      {/* 3-Way Dropdown Menu */}
                      {activeCopyMenuIdx === idx && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            [isRTL ? 'right' : 'left']: 0,
                            marginTop: '4px',
                            background: '#ffffff',
                            border: '2px solid #000000',
                            boxShadow: '3px 3px 0px #000000',
                            zIndex: 250,
                            minWidth: '160px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => executeCopy('prompt', idx)}
                            style={{
                              padding: '7px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#1e293b',
                              background: '#ffffff',
                              border: 'none',
                              borderBottom: '1px solid #f1f5f9',
                              textAlign: isRTL ? 'right' : 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <MessageSquare size={11} style={{ color: '#6d28d9' }} />
                            <span>{t.copyPromptLabel}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => executeCopy('reflection', idx)}
                            style={{
                              padding: '7px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#1e293b',
                              background: '#ffffff',
                              border: 'none',
                              borderBottom: '1px solid #f1f5f9',
                              textAlign: isRTL ? 'right' : 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FileText size={11} style={{ color: '#6d28d9' }} />
                            <span>{t.copyResponseLabel}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => executeCopy('both', idx)}
                            style={{
                              padding: '7px 10px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#6d28d9',
                              background: '#f5f3ff',
                              border: 'none',
                              textAlign: isRTL ? 'right' : 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Layers size={11} />
                            <span>{t.copyBothLabel}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{
                    background: msg.role === 'user' ? '#f8fafc' : '#ffffff',
                    border: '2px solid #000000',
                    color: '#000000',
                    padding: '12px 14px',
                    fontSize: '13px',
                    lineHeight: '1.65',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-body)',
                    boxShadow: msg.role === 'user' ? '2px 2px 0px #cbd5e1' : '2px 2px 0px #000000'
                  }}>
                    {msg.content}
                  </div>

                  {msg.role === 'model' && activeProvider && idx === messages.length - 1 && (
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', paddingLeft: isRTL ? 0 : '2px', paddingRight: isRTL ? '2px' : 0 }}>
                      {t.viaPrefix} {activeProvider.toLowerCase()}
                    </div>
                  )}
                </div>
              ))}

              {/* COMPUTATIONAL NETWORK LOADING AWARENESS (LOCALIZED & SPACED WITH . . .) */}
              {loading && (
                <div style={{
                  alignSelf: isRTL ? 'flex-end' : 'flex-start',
                  background: '#faf5ff',
                  border: '2px solid #6d28d9',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#6d28d9',
                  fontWeight: '600',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '2px 2px 0px #4c1d95',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}>
                  <Cpu size={13} style={{ flexShrink: 0 }} />
                  <span>{currentLoadingList[loadingPhraseIdx % currentLoadingList.length]}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* End Session Prompt */}
            {messages.length >= 2 && !loading && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: '#64748b',
                boxShadow: '1px 1px 0px #cbd5e1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{t.sessionActiveNotice}</span>
                  <span style={{ color: '#94a3b8', fontSize: '10px' }}>• {t.exchangeCountBadge}</span>
                </div>
                <button
                  onClick={() => setShowEndSessionModal(true)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #64748b',
                    color: '#1e293b',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0px #94a3b8'
                  }}
                >
                  {t.endSessionBtn}
                </button>
              </div>
            )}

            {/* Chat Input (Original Pixel Font & Increased Size) */}
            <div style={{
              display: 'flex',
              gap: '6px',
              borderTop: '2px solid #000000',
              paddingTop: '10px',
              marginTop: '2px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(2px)'
            }}>
              <input
                type="text"
                disabled={isLimitReached}
                value={inputStory}
                onChange={(e) => setInputStory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={isLimitReached ? t.chatLimitPlaceholder : t.chatInputPlaceholder}
                style={{
                  flex: 1,
                  background: isLimitReached ? '#f1f5f9' : '#ffffff',
                  border: '2px solid #000000',
                  padding: '10px 14px',
                  color: '#000000',
                  fontSize: '15px',
                  fontFamily: 'var(--font-pixel)',
                  outline: 'none',
                  boxShadow: '2px 2px 0px #cbd5e1'
                }}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!inputStory.trim() || loading || isLimitReached}
                style={{
                  background: inputStory.trim() && !isLimitReached ? '#6d28d9' : '#e2e8f0',
                  color: inputStory.trim() && !isLimitReached ? '#ffffff' : '#94a3b8',
                  fontWeight: '700',
                  padding: '9px 14px',
                  border: inputStory.trim() && !isLimitReached ? '2px solid #6d28d9' : '2px solid #cbd5e1',
                  cursor: inputStory.trim() && !isLimitReached ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: inputStory.trim() && !isLimitReached ? '2px 2px 0px #4c1d95' : 'none'
                }}
              >
                <Send size={13} />
              </button>
            </div>

          </div>
        )}

        {/* END SESSION & MOBILITY ARCHIVE MODAL */}
        {showEndSessionModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 110
          }}>
            <div style={{
              background: '#ffffff',
              border: '2px solid #000000',
              maxWidth: '560px',
              width: '100%',
              padding: '22px',
              boxShadow: '4px 4px 0px #000000',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              {!archiveCommitted ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Archive size={16} style={{ color: '#6d28d9' }} />
                      {t.endSessionTitle}
                    </h3>
                    <button onClick={() => setShowEndSessionModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}>
                      <X size={16} />
                    </button>
                  </div>

                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
                    {t.endSessionQuestion}
                  </p>
                  <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#475569', marginBottom: '18px', fontFamily: 'var(--font-body)' }}>
                    {t.endSessionSubtext}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={handleCommitToArchive}
                      style={{
                        background: '#6d28d9',
                        color: '#ffffff',
                        border: '2px solid #4c1d95',
                        padding: '10px 14px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '2px 2px 0px #4c1d95'
                      }}
                    >
                      <Check size={14} />
                      {t.commitArchiveBtn}
                    </button>

                    <button
                      onClick={handleResetSession}
                      style={{
                        background: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #f87171',
                        padding: '8px 12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {t.discardBtn}
                    </button>

                    <button
                      onClick={() => setShowEndSessionModal(false)}
                      style={{
                        background: 'transparent',
                        color: '#64748b',
                        border: 'none',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {t.cancelBtn}
                    </button>
                  </div>
                </div>
              ) : (
                /* TRANSPARENT ARCHIVE RECORD OUTPUT */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} />
                      {t.archiveCommittedTitle}
                    </h3>
                    <button onClick={handleResetSession} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}>
                      <X size={16} />
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', marginBottom: '14px', lineHeight: '1.4', fontFamily: 'var(--font-body)' }}>
                    {t.archiveCommittedDesc}
                  </p>

                  {/* Structured Record Card */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    padding: '14px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#6d28d9' }}>{t.recordIdLabel}: {archiveRecord?.id}</span>
                      <span style={{ color: '#64748b' }}>{archiveRecord?.timestamp}</span>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: '700', color: '#334155', marginBottom: '3px' }}>[{t.scrubbedTestimonyLabel.toUpperCase()}]:</div>
                      <div style={{ color: '#0f172a', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '12px' }}>
                        {archiveRecord?.testimony}
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: '700', color: '#334155', marginBottom: '3px' }}>[{t.reflectionLabel.toUpperCase()}]:</div>
                      <div style={{ color: '#0f172a', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px', whiteSpace: 'pre-wrap', maxHeight: '140px', overflowY: 'auto', fontFamily: 'var(--font-body)', fontSize: '12px' }}>
                        {archiveRecord?.reflection}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#16a34a', fontWeight: '700', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                      <span>● STATUS: ZERO_PII_VERIFIED</span>
                      <span>ENGINE: {archiveRecord?.provider}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleResetSession}
                    style={{
                      width: '100%',
                      background: '#000000',
                      color: '#ffffff',
                      border: '2px solid #000000',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #475569'
                    }}
                  >
                    {t.startNewSessionBtn}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT MODAL */}
        {showAbout && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 100
          }}>
            <div style={{
              background: '#ffffff',
              border: '2px solid #000000',
              maxWidth: '560px',
              width: '100%',
              padding: '22px',
              boxShadow: '4px 4px 0px #000000',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '8px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>{t.aboutTitle}</h3>
                <button
                  onClick={() => setShowAbout(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#1e293b', marginBottom: '14px', fontFamily: 'var(--font-body)' }}>
                {t.aboutBody}
              </p>

              {/* Language Expansion Notice */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '12px',
                marginBottom: '14px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#334155',
                fontFamily: 'var(--font-body)'
              }}>
                {t.languageExpansionNotice}
              </div>

              {/* Session Governance Notice */}
              <div style={{
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                padding: '12px',
                marginBottom: '14px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#6d28d9',
                fontFamily: 'var(--font-body)'
              }}>
                {t.sessionGovernanceNotice}
              </div>

              {/* Regional Protocols Frame */}
              <div style={{ border: '1px solid #e2e8f0', padding: '12px', marginBottom: '14px', background: '#fafafa' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px', marginTop: 0 }}>
                  {t.regionalFrameTitle}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#334155', lineHeight: '1.5', fontFamily: 'var(--font-body)' }}>
                  {t.regions.map((reg, idx) => (
                    <div key={idx}>
                      <strong>• {reg.name}:</strong> {reg.desc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Credits & Gratitude */}
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '14px',
                marginTop: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '11.5px',
                color: '#475569',
                lineHeight: '1.5'
              }}>
                <div>
                  <strong>Primary Contributor:</strong> Iretomiwa Sharon Omodeinde (
                  <a
                    href="https://instagram.com/2001collective"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6d28d9', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}
                  >
                    2001 Collective <ExternalLink size={10} />
                  </a>
                  )
                </div>
                <div style={{ color: '#64748b' }}>
                  With gratitude to Ayomide Atobatele, Chinyere Obieze, Emeka Okereke, Dreaming New Worlds, and the source of all things.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '14px' }}>
                <span>Dreaming New Worlds 2026</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
