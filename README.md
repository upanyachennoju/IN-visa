# 🇮🇳 VisaFlow — Indian Visa Application Platform

VisaFlow is a modernized, civic-focused web application for processing Indian e-Visa applications. It streamlines the multi-step visa application process with a clean 15-section guided navigation shell, file-based SQLite persistence, automated AI document quality checks, plain-language validation error explainers, cross-field consistency verification, and a real-time status tracking portal.

> **Disclaimer:** Independent hackathon concept prototype — not affiliated with the Government of India. OTP verification and messaging dispatches are simulated for demonstration purposes.

---

## ✨ Features & Architecture Highlights

### 📋 15-Section Guided Application Shell
- **Full Form Coverage:** Supports Application Context, Identity, Passport, Contact, Address, Family, Occupation, Visa Trip, Previous India Travel, Travel History, References, Background Answers, Documents, Photo Status, and Final Submission.
- **Session Resume (`tempId`):** Applicants can save progress at any step and resume later via `#/resume` using their unique `tempId`.

### 🔐 Contact Verification & OTP Flow
- Independent **Email OTP** and **Phone OTP** generation and verification.
- Simulated SMS, WhatsApp, and Email dispatch logging.

### 🖼️ AI Photo & Document Quality Checker (`Section 13`)
- **Endpoint:** `POST /api/documents/photo-check`
- Integrates OpenAI **Vision** (`gpt-4o-mini-vision`) to inspect uploaded photo/passport images for face visibility, centering, background plainness, resolution adequacy, and blur/glare.
- Strict JSON result structure with actionable fix instructions and a 5-second race-condition timeout fallback.

### 💡 AI Plain-Language Validation Error Explainer
- **Endpoint:** `POST /api/explain-error`
- Replaces raw validation messages with clear, non-technical, human-friendly guidance using OpenAI `gpt-4o-mini`.
- Optimized performance: Debounced to execute exclusively on field `onBlur` and section `onSubmit` with client-side in-memory caching.
- Fallback: Gracefully displays raw error strings if API calls fail or time out.

### 📝 Review & Final Submission (`Section 15`)
- **Endpoint:** `POST /api/applications/:tempId/submit`
- Grouped read-only summary of all completed sections.
- **Server-Side Cross-Field Consistency Checks:** Validates matching values across sections (e.g. `Date of Birth` in Context vs. Identity; `Port of Arrival` in Context vs. Visa Trip) and blocks submission if conflicts exist.
- **Mandatory Declaration:** Requires applicant declaration before enabling submission.
- **Reference Generation:** Generates synthetic final reference numbers (`IND-XXXXXX`) and updates application status to `SUBMITTED`.

### ⏱️ Status Tracker & AI Status Explainer
- **Endpoint:** `GET /api/status/:finalReferenceNumber`
- **Route:** `#/status/:finalReferenceNumber`
- Converts internal status enums into warm, citizen-focused explanations using OpenAI `gpt-4o-mini`.
- Includes a synthetic **Wait-Time Estimator** mapped by visa type and purpose (e.g., Medical: 1-2 days, Business: 2-4 days, Tourist: 3-5 days).

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js, SQLite (`better-sqlite3`), Multer, OpenAI SDK.
- **Frontend:** React, Vite, Vanilla CSS with custom design tokens (`var(--civic)`, `--surface`, `--line`).
- **Database:** File-based SQLite (`backend/data/visa_flow.db`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18.x or higher
- **npm:** v9.x or higher
- **OpenAI API Key:** Required for AI Vision photo check & error explainers.

### 1. Backend Setup

```bash
cd backend
npm install
```

Set your OpenAI API key and start the server:

```bash
export OPENAI_API_KEY="your-openai-api-key"
npm run dev
```

The Express server will start on `http://localhost:3000` (or `PORT` defined in environment) and initialize the SQLite database file at `backend/data/visa_flow.db`.

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start (typically at `http://localhost:5173`).

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/contact` | Create new draft application & return `tempId` |
| `POST` | `/api/contact/:appId/otp/email` | Send mock email OTP |
| `POST` | `/api/contact/:appId/otp/phone` | Send mock phone OTP |
| `POST` | `/api/contact/:appId/verify` | Verify email & phone OTPs |
| `POST` | `/api/applications/application-context` | Create a draft, save Application Context, and advance to Identity |
| `POST` | `/api/applications/:tempId/:section` | Save a later section, persist progress, and return the next section |
| `GET` | `/api/applications/:tempId` | Retrieve full application & saved section data |
| `POST` | `/api/documents/photo-check` | Analyze uploaded image via OpenAI Vision |
| `POST` | `/api/explain-error` | Generate plain-language error explainer via OpenAI |
| `POST` | `/api/applications/:tempId/submit` | Run cross-field checks & submit application (`IND-XXXXXX`) |
| `GET` | `/api/status/:refNumber` | Get AI status explanation & wait-time estimate |

---

## 📂 Project Structure

```
IN-visa/
├── backend/
│   ├── data/             # File-based SQLite DB (visa_flow.db)
│   ├── package.json
│   └── server.js         # Express server & API routes
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # 15-step navigation shell & main router
│   │   ├── DocumentUpload.jsx# Section 13 photo/document checker UI
│   │   ├── ReviewSubmit.jsx  # Section 15 review & submission component
│   │   ├── StatusPage.jsx    # Standalone status tracking page
│   │   ├── errorExplainer.js # Client-side AI error explanation cache/fetcher
│   │   ├── main.jsx
│   │   └── styles.css        # Civic design system tokens & styles
│   ├── index.html
│   └── package.json
├── changelog.md          # Chronological step-by-step build log
├── decisions.md          # Architectural & technical design decisions
├── flow.md               # System state & capabilities overview
└── README.md
```

---

## 📄 License

MIT License.
