# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## A Safe Passage: Conversational Mobility & Empirical Governance Engine

**Document Version:** 1.2.0  
**Project:** *A Safe Passage* — 2001 Collective  
**Product Name:** A Safe Passage Governance Engine (ASP-GE)  
**Lead Systems Architect & Business Analyst:** 2001 Collective  
**Target Delivery Window:** Lagos Prototype Intensive & Public Showcase (August – September 2026)  
**Status:** Approved for Implementation  

---

## 1. EXECUTIVE SUMMARY & FEASIBILITY REALISM

### 1.1 Feasibility Assessment: Realism vs. Over-Engineering
To make this system 100% buildable and deployable within the 4-week intensive:
* **The AI Conversational Layer:** **100% Feasible & Immediate**. Powered by Google Gemini 1.5 Flash serverless API via Vercel, providing fast (~1.5s), multilingual (EN/FR), and low-cost multi-turn dialogue.
* **The Empirical Sensing Layer:** **Feasible through Pre-Fetched / Cached Geo-JSON Data**. Rather than calling live, heavy satellite compute for every user prompt, the system utilizes pre-processed, open-access satellite radar (Sentinel-1 SAR) and radio-frequency (OpenCelliD RF bleed) datasets for key border corridors (e.g., Seme-Krake, Malanville, Paga, Galafi).
* **The Data Storage Layer:** **100% Feasible**. Zero-PII anonymous storage on Supabase PostgreSQL free tier.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       3-TIER FEASIBLE ARCHITECTURE                          │
│                                                                             │
│ [ Mobile Web UI (React/Vite) ]  ──> [ Serverless Vercel API /api/chat ]      │
│                                                   │                         │
│                    ┌──────────────────────────────┴──────────────────────┐  │
│                    ▼                                                     ▼  │
│      [ Gemini 1.5 Flash Engine ]                          [ Cached Empirical]
│      • Post-National Philosophy                           [ Geo-Data Layer  ]
│      • Treaty Modules (ECOWAS/AU/AES)                     • SAR Radar Queues│
│      • English & French Dialogue                          • RF Signal Bleed │
│                    │                                                     │  │
│                    └──────────────────────────────┬──────────────────────┘  │
│                                                   │                         │
│                                                   ▼                         │
│                                  [ Anonymous Supabase Archive ]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. THE EPISTEMOLOGICAL MODEL: TREATIES AS DYNAMIC FIRMWARE

The system explicitly structures state treaties as **perishable, secondary "firmware"** and human/ecological reality as **primary "hardware"**:

1. **Primary Ground Truth:** Lived human movement, ecological corridors (Harmattan dust, river basins), physical freight queues, and electromagnetic wave propagation.
2. **Secondary Administrative Layer:** ECOWAS 1975/1979, AU Free Movement & AfCFTA 2018, and AES 2023–2026 Directives.
3. **Graceful Handling of Treaty Divergence:** When regional pacts are suspended, overwritten, or annulled, the AI dynamically notes the administrative shift without breaking its primary grounding in human dignity and Afropolitan relation (Glissant, Mbembe, Fanon).

---

## 3. EMPIRICAL SENSING INDICATOR INTEGRATION

The AI grounds user stories in empirical physical parameters across the **3 Core Indicators**:

| Indicator | Primary Physical Reality | Empirical Sensing Data Source | How It Functions in ASP-GE |
| :--- | :--- | :--- | :--- |
| **1. Free Movement of Mass** | Physical freight bottlenecks, cargo transport, customs blockades. | **Copernicus Sentinel-1 SAR (Synthetic Aperture Radar)** | Detects metallic radar backscatter anomalies ($\gamma^0$) to calculate stationary haulage truck queue lengths at border checkpoints. |
| **2. Free Movement of Data** | Cross-border telecommunications, roaming boundaries. | **OpenCelliD & ITU Spectrum Maps** | Models **RF Signal Bleed** (cell tower radiation extending 15–25 km across borders), proving data naturally defies borders. |
| **3. Free Movement of People** | Lived human migration, checkpoint illumination. | **NASA/NOAA VIIRS Nighttime Radiance** | Maps cross-border luminous continuity vs. artificial checkpoint dark-zones. |

---

## 4. DUAL REFLECTION OUTPUT MODEL (ACTIVATION VS. AMENDMENT)

When synthesizing a user's story, the engine dynamically selects between two distinct synthesis modes:

* **Mode A: Activation Protocol (When Law Exists, but Bureaucracy/Mistrust Blocks It):**
  * *Diagnostic:* Treaty already codified the right (e.g., 90-day visa-free entry; 0% agricultural tariff).
  * *Output:* Cites the exact article, exposes the institutional failure/rent-seeking, and proposes a citizen transparency/verification mechanism.
* **Mode B: Community Amendment Protocol (When an Institutional Silence Exists):**
  * *Diagnostic:* No treaty exists for this domain (e.g., cross-border digital gig-worker payments, roaming caps).
  * *Output:* Details the treaty silence and co-creates a brand-new bottom-up policy rule.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PASSAGE REFLECTION & SENSING CARD                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📖 THE LIVING STORY:                                                        │
│ "Waited 36 hours at the border crossing with a truck of perishable goods."  │
│                                                                             │
│ 🛰️ EMPIRICAL SENSING GROUND-TRUTH:                                          │
│ Radar backscatter anomaly (Sentinel-1 SAR) confirms 2.4 km stationary       │
│ freight queue along the border corridor.                                    │
│                                                                             │
│ 📜 THE TREATY LAYER (PERISHABLE CODE):                                      │
│ AfCFTA Protocol on Trade in Goods & ECOWAS ETLS mandate zero tariff and     │
│ priority clearance for intra-African perishable cargo.                      │
│                                                                             │
│ ⚖️ SYSTEM DIAGNOSIS (ACTIVATION VS. AMENDMENT):                             │
│ The right exists in written law; the breakdown is human checkpoint opacity │
│ and lack of real-time digital verification.                                 │
│                                                                             │
│ ✨ COMMUNITY ACTIVATION PROTOCOL:                                           │
│ "A zero-knowledge digital manifest verifiable via basic USSD/SMS 10 km      │
│  before border arrival to bypass manual officer negotiation."               │
│                                                                             │
│ [ 💾 Save Anonymous Reflection to Public Archive ]                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. USER INTERFACE & BILINGUAL SPECIFICATIONS

* **Language Support:** Native bilingual support for **English** and **French (*Français*)** with automatic language detection and manual navbar toggle (`EN | FR`).
* **Visual Palette:** Dark obsidian background (`#0B0F19`), glowing warm amber accents (`#F59E0B`), and deep slate cards (`#1E293B`).
* **Storytelling Onramp:**
  > *"Have you (or someone close to you) ever experienced a snag—or a moment of unexpected grace—while travelling across African borders?"*

---

## 6. STRICT ZERO-PII SPECIFICATIONS

* **Zero Account Creation:** No login, registration, phone number, or email required.
* **Edge Anonymization:** Client IP addresses are discarded at the serverless edge.
* **Automated Middleware Scrubber:** Regex filters strip personal names, passport numbers, flight booking codes, and phone numbers before writing to the public database.
* **Database Schema (Supabase PostgreSQL):**

```sql
CREATE TABLE public_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    language VARCHAR(5) DEFAULT 'en' NOT NULL,
    story_summary TEXT NOT NULL,
    empirical_sensor_note TEXT,
    treaty_diagnosis_type VARCHAR(20) CHECK (treaty_diagnosis_type IN ('ACTIVATION', 'AMENDMENT', 'GRACE')),
    treaty_reference TEXT,
    community_protocol TEXT NOT NULL,
    upvote_count INTEGER DEFAULT 0
);

ALTER TABLE public_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON public_reflections FOR SELECT USING (true);
CREATE POLICY "Anonymous Insert Access" ON public_reflections FOR INSERT WITH CHECK (true);
```

---

## 7. IMMEDIATE NEXT ACTION STEPS

1. **Step 1 (Week 1 of Intensive):** Ayomide initializes the Next.js/React frontend repository and sets up the serverless `/api/chat` endpoint on Vercel.
2. **Step 2 (Week 1 of Intensive):** Sharon compiles the structured legal chunks for ECOWAS, AU, and AES treaties + pre-curated SAR radar and RF border coordinate notes.
3. **Step 3 (Week 2 of Intensive):** Connect Gemini 1.5 Flash API with the bilingual system prompt and verify the Dual Reflection output formatting.
4. **Step 4 (Week 3 of Intensive):** Deploy live production site to custom domain and print high-resolution QR codes for the physical prototype arch at The Hangar Lagos.
