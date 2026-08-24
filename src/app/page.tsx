'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Send, 
  Globe2, 
  Info, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Satellite, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  X
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function SafePassageApp() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputStory, setInputStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      title: 'A Safe Passage',
      subtitle: 'Conversational Mobility & Empirical Governance Engine',
      heroTag: 'Édouard Glissant · Achille Mbembe · Frantz Fanon',
      heroQuote: 'Africa’s treaties (ECOWAS 1975, AU 2018, AES 2023–2026) already envisioned continental borderlessness. The failure to build that world is bureaucratic, not imaginative.',
      onboardingPrompt: 'Have you (or someone close to you) ever experienced a snag—or a moment of unexpected grace—while travelling across African borders?',
      inputPlaceholder: 'Share an experience (e.g. checkpoint delays, passport hassle, seamless road trip, transport of goods)...',
      sendBtn: 'Send Reflection',
      presetHeader: 'Or select a common experience to begin:',
      presets: [
        'I was delayed at a border checkpoint carrying local farm produce.',
        'My transit flight was re-routed and baggage delayed without explanation.',
        'I experienced wonderful cross-border hospitality in a neighboring country.',
        'Data roaming fees were exorbitant the moment I crossed the frontier.'
      ],
      chatTitle: 'Active Deliberation & Passage Reflection',
      resetBtn: 'Start New Reflection',
      aboutNav: 'About & Philosophy',
      aboutTitle: 'About A Safe Passage',
      aboutBody: 'A Safe Passage is an interactive civic informatics engine developed by 2001 Collective (Iretomiwa Sharon Omodeinde & Ayomide Daniel Atobatele). It treats borders not as physical walls, but as distributed authentication networks. Grounded in post-national and pan-African philosophy, the system stress-tests lived human mobility against regional legal codes and empirical earth-observation telemetry (Sentinel-1 SAR radar freight queues & OpenCelliD RF spectrum overlap).',
      zeroPiiBadge: 'Zero-PII Secure: No names, phone numbers, or personal IDs stored.',
      thinking: 'Analyzing treaty codes & empirical sensing data...'
    },
    fr: {
      title: 'A Safe Passage',
      subtitle: 'Moteur de Mobilité Conversationnelle & Gouvernance Empirique',
      heroTag: 'Édouard Glissant · Achille Mbembe · Frantz Fanon',
      heroQuote: 'Les traités africains (CEDEAO 1975, UA 2018, AES 2023–2026) imaginaient déjà un continent sans frontières. L\'échec à bâtir ce monde est bureaucratique, non imaginatif.',
      onboardingPrompt: 'Avez-vous (ou un proche) déjà vécu un obstacle — ou un moment de grâce inattendu — en traversant les frontières africaines ?',
      inputPlaceholder: 'Partagez une expérience (ex: tracasseries au poste, passeport, voyage fluide, transport de marchandises)...',
      sendBtn: 'Envoyer',
      presetHeader: 'Ou choisissez une expérience courante pour commencer :',
      presets: [
        'J\'ai été retardé à un poste frontière en transportant des produits vivriers.',
        'Mon vol de correspondance a été dérouté et mes bagages bloqués.',
        'J\'ai reçu un accueil chaleureux et solidaire dans un pays voisin.',
        'Les frais d\'itinérance de données étaient exorbitants dès le passage.'
      ],
      chatTitle: 'Délibération Active & Réflexion de Passage',
      resetBtn: 'Nouvelle Réflexion',
      aboutNav: 'À Propos & Philosophie',
      aboutTitle: 'À Propos de A Safe Passage',
      aboutBody: 'A Safe Passage est un moteur civique interactif conçu par le Collectif 2001 (Iretomiwa Sharon Omodeinde & Ayomide Daniel Atobatele). Il aborde les frontières non comme des barrières physiques, mais comme des protocoles d\'authentification distribués. Ancré dans la pensée post-nationale panafricaine, le système évalue les réalités vécues face aux traités et aux données satellitaires (Radar SAR Sentinel-1 & spectre RF OpenCelliD).',
      zeroPiiBadge: 'Zéro-Donnée Personnelle : Aucun nom ni identifiant conservé.',
      thinking: 'Analyse des traités et télémétrie satellitaire en cours...'
    }
  }[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (overrideText?: string) => {
    const textToSend = overrideText || inputStory;
    if (!textToSend.trim() || loading) return;

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
        body: JSON.stringify({
          messages: newMessages,
          language
        })
      });

      const data = await response.json();
      if (data.reply) {
        setMessages([
          ...newMessages,
          { role: 'model', content: data.reply }
        ]);
      } else {
        setMessages([
          ...newMessages,
          { 
            role: 'model', 
            content: language === 'fr' 
              ? 'Désolé, une erreur est survenue lors de l\'analyse. Veuillez réessayer.' 
              : 'Apologies, an error occurred during analysis. Please try again.' 
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { 
          role: 'model', 
          content: language === 'fr' 
            ? 'Connexion interrompue. Veuillez vérifier votre réseau.' 
            : 'Connection error. Please check your network and try again.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '640px', margin: '0 auto', width: '100%', padding: '16px' }}>
      
      {/* HEADER NAVBAR */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass style={{ color: 'var(--accent-amber)', width: '24px', height: '24px' }} />
          <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>{t.title}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            style={{ 
              background: 'var(--bg-card)', 
              color: 'var(--accent-amber)', 
              border: '1px solid var(--border-color)', 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Globe2 size={14} />
            {language.toUpperCase()}
          </button>

          {/* About Modal Button */}
          <button 
            onClick={() => setShowAbout(true)}
            style={{ 
              background: 'transparent', 
              color: 'var(--text-secondary)', 
              border: 'none', 
              padding: '6px', 
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={t.aboutNav}
          >
            <Info size={18} />
          </button>
        </div>
      </header>

      {/* MAIN BODY: ONBOARDING VIEW (If no messages) */}
      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Hero Banner */}
          <div style={{ 
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(21, 29, 48, 0.4) 100%)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px', 
            padding: '20px',
            boxShadow: '0 8px 24px var(--accent-amber-glow)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>
              <Sparkles size={12} />
              <span>{t.heroTag}</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t.heroQuote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={13} />
              <span>{t.zeroPiiBadge}</span>
            </div>
          </div>

          {/* Interactive Welcoming Prompt */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} style={{ color: 'var(--accent-amber)' }} />
              {t.onboardingPrompt}
            </h2>

            <textarea 
              value={inputStory}
              onChange={(e) => setInputStory(e.target.value)}
              placeholder={t.inputPlaceholder}
              rows={3}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'none',
                outline: 'none'
              }}
            />

            <button
              onClick={() => handleSubmit()}
              disabled={!inputStory.trim() || loading}
              style={{
                marginTop: '12px',
                width: '100%',
                background: inputStory.trim() ? 'var(--accent-amber)' : 'var(--bg-card-hover)',
                color: inputStory.trim() ? '#0B0F19' : 'var(--text-muted)',
                fontWeight: '600',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: inputStory.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{t.sendBtn}</span>
              <Send size={15} />
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '500' }}>
              {t.presetHeader}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {t.presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(preset)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-amber)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  <span>{preset}</span>
                  <ArrowRight size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* CHAT VIEW (Active Multi-Turn Deliberation) */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* Chat Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} />
              {t.chatTitle}
            </span>
            <button 
              onClick={() => setMessages([])}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
            >
              <RotateCcw size={12} />
              {t.resetBtn}
            </button>
          </div>

          {/* Chat Messages Flow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  background: msg.role === 'user' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '14px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.role === 'model' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <Compass size={14} style={{ color: 'var(--accent-amber)' }} />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      A Safe Passage Governance Engine
                    </span>
                  </div>
                )}
                {msg.content}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Satellite size={16} className="animate-spin" />
                <span>{t.thinking}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <input 
              type="text"
              value={inputStory}
              onChange={(e) => setInputStory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={language === 'fr' ? 'Poursuivre la délibération...' : 'Continue deliberation or refine rule...'}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!inputStory.trim() || loading}
              style={{
                background: inputStory.trim() ? 'var(--accent-amber)' : 'var(--bg-card)',
                color: inputStory.trim() ? '#0B0F19' : 'var(--text-muted)',
                padding: '0 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: inputStory.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}

      {/* ABOUT MODAL */}
      {showAbout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass style={{ color: 'var(--accent-amber)' }} size={20} />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{t.aboutTitle}</h3>
              </div>
              <button 
                onClick={() => setShowAbout(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t.aboutBody}
            </p>

            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-amber)', marginBottom: '6px', textTransform: 'uppercase' }}>
                {language === 'fr' ? 'Cadre des Trois Traités' : 'The Three-Treaty Framework'}
              </h4>
              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.5' }}>
                <li><strong>ECOWAS (1975/1979):</strong> Protocole de Libre Circulation & Schéma ETLS.</li>
                <li><strong>African Union (2018):</strong> Protocole de Libre Circulation & ZLECAf (AfCFTA).</li>
                <li><strong>AES (2023–2026):</strong> Passeport Unifié & Directives de Mobilité Sahélienne.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>2001 Collective · DNW 2026</span>
              <span style={{ color: 'var(--accent-green)' }}>● Zero-PII Enforced</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
