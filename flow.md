# Flow

Current state:
- Backend Express server (`backend/server.js`) with file-based SQLite database (`data/visa_flow.db`) supports Application Context, Identity, Passport, Address, Family, Occupation, Visa / Trip, Previous India Travel, Travel History, References, Background Answers, Contact state, resume-by-`tempId` lookup, and `POST /api/documents/photo-check` quality validation endpoint using OpenAI `gpt-4o-mini-vision`.
- Frontend has a 15-step navigation shell, working forms for sections 1-12, and Section 13 (Documents) with integrated photo and passport document quality checking UI, inline criterion checklist, fix instructions, and immediate re-upload.

