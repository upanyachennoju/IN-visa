# Flow

Current state:
- Backend Express server (`backend/server.js`) with file-based SQLite database (`data/visa_flow.db`) supports all 15 application sections, draft state, resume-by-`tempId`, `POST /api/documents/photo-check` (vision model), `POST /api/explain-error` (text model), `POST /api/applications/:tempId/submit` (cross-field validation & `IND-XXXXXX` reference generation), and `GET /api/status/:finalReferenceNumber` (warm status explainer & wait-time estimator).
- Frontend features a complete 15-step navigation shell, AI-driven plain-language error explainers on blur/submit, Section 13 document quality checker, Section 15 review & submission screen, and standalone `StatusPage` accessible by final reference number (`#/status/:finalReferenceNumber`).




