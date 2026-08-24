# A Safe Passage — Public AI Governance Engine

> A mobile-first, conversational civic informatics engine grounded in African post-national thought (Édouard Glissant, Achille Mbembe, Frantz Fanon). It treats borders as distributed authentication protocols, evaluates lived mobility experiences against regional treaties (ECOWAS, AU, AES), and integrates empirical satellite radar and radio-frequency sensing data.

---

## Repository Structure

```
AI PUBLIC/
├── docs/
│   ├── PRD.md                                          # Complete Product Requirements Document (v1.2.0)
│   ├── empirical_tracking_and_dynamic_treaties.md      # Satellite SAR & RF signal bleed architecture
│   ├── dual_reflection_model_activation_vs_amendment.md# Activation vs Amendment protocol diagnosis
│   └── taxonomy_of_non_human_mass.md                   # 6-part physical mass classification
├── src/
│   ├── app/
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts                           # Next.js Serverless API Route with Gemini 1.5 Flash
│   └── data/
│       └── knowledge_base_treaties_and_empirical.json # Structured treaty corpus & empirical telemetry
├── .env.example                                       # Template for environment variables
└── README.md
```

---

## Quick Start

### 1. Requirements
- Node.js 18+ or 20+
- Next.js 14+ (App Router)
- Google Gemini API Key

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. API Usage
`POST /api/chat`
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I was stopped at Seme border while transporting cassava flour..."
    }
  ],
  "language": "en"
}
```

---

## Key Features
- **Zero-PII Architecture**: Regex scrubber automatically strips emails, phone numbers, and passport identifiers before processing or storage.
- **Empirical Sensing Data**: Grounded in Copernicus Sentinel-1 SAR (haulage queue backscatter) and OpenCelliD RF signal bleed metrics.
- **Dual Reflection Engine**: Diagnoses whether an experience is an **Activation Failure** (rights exist on paper, blocked by bureaucracy/extortion) or an **Amendment Failure** (unlegislated institutional silence).
- **Bilingual**: Native English and French support.

---

## Authors & Credits
- **2001 Collective**: Iretomiwa Sharon Omodeinde
- Developed for **Dreaming New Worlds (DNW) 2026**
