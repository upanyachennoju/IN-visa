# Flow

Current state:
- Backend Express server (`backend/server.js`) with file-based SQLite database (`data/visa_flow.db`) supports Application Context, Identity, Passport, Address, Family, Occupation, Visa / Trip, Previous India Travel, Travel History, References, Background Answers, Contact state, resume-by-`tempId` lookup, `POST /api/documents/photo-check` quality validation, `POST /api/explain-error` AI error explainer, and `POST /api/applications/:tempId/submit` endpoint with cross-field consistency checks and `IND-XXXXXX` reference number generation.
- Frontend has a complete 15-step application flow, including read-only section summaries, cross-field mismatch detection, mandatory declaration checkbox, final submission, and confirmation screen.



