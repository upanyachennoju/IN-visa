# Flow

Current state:
- Backend Express server (`backend/server.js`) with file-based SQLite database (`data/visa_flow.db`) supports Application Context, Identity, Passport, Address, Family, Occupation, Visa / Trip, Previous India Travel, Travel History, References, Background Answers, Contact state, resume-by-`tempId` lookup, `POST /api/documents/photo-check` quality validation endpoint, and `POST /api/explain-error` AI plain-language validation error explainer endpoint using `gpt-4o-mini`.
- Frontend has a 15-step navigation shell, working forms for sections 1-12 retrofitted with AI plain-language validation error explainers firing on blur and section submission, and Section 13 (Documents) with integrated photo and passport document quality checking UI.


