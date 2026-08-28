# Decisions

- Primary civic tone: navy — fits a formal public-service feel while staying clear under the flat-color constraint.
- Used Maven + Spring Boot Data JPA + H2 with `create-drop` — the simplest hackathon-friendly persistence scaffold with no migrations.
- Used a single nested `Application` entity file — keeps the requested structure grouped without adding extra domain classes.
- Used Vite + `react-router-dom` for the frontend shell — provides the requested placeholder route with minimal setup.
- Primary civic hex confirmed: `#102a43` — keeps the flat UI in the agreed navy tone.
- Added a hidden internal numeric database id plus a public short `tempId` — this lets the draft persist before OTP verification while still generating the requested short reference only after both OTPs pass.
- Used direct `http://localhost:3000` API calls from the browser — simplest path for this single-screen prototype with simulated delivery.
- Stored the current section on the application record — the resume endpoint can restore the user to the section they last reached without inventing a separate state store.
- Used hash-based app navigation for `#/resume` and `#/app/{tempId}` — it works cleanly with the file-based browser context while keeping the shell lightweight.
- Created the draft on Application Context save and returned both `applicationId` and `tempId` — the shell can resume by `tempId` while still using the older Contact OTP endpoints by numeric id.
- Used a synthetic passport pattern of `VF-XXXXXX` — it is obviously fake and avoids validating any real-world passport scheme.
- Mirrored present address into permanent address when "same as present" is checked — that keeps the Address section simple while still sending a complete payload to the backend.
- Used comma-separated text inputs for list-backed trip/history fields — it keeps the prototype compact while still serializing cleanly to backend lists.
- Modeled Background Answers as yes/no plus conditional detail textareas — that keeps the sensitive section explicit and avoids any AI processing.
- Migrated backend to Express + file-based SQLite (`better-sqlite3`, `data/visa_flow.db`) — ensures persistence across server restarts while maintaining minimal overhead.
- Used OpenAI Vision model `gpt-4o-mini-vision` for `POST /api/documents/photo-check` — selected for high vision accuracy, rapid response times, and cost efficiency.
- Implemented a 5-second race-condition timeout fallback and error handling — if the OpenAI API call fails or times out after 5s, the system responds gracefully with `overallPass: false` and the instruction "We couldn't check your photo automatically — please make sure your face is clearly visible against a plain background." alongside specific guidance, preventing applicant UI dead ends.
- Used OpenAI text model `gpt-4o-mini` for `POST /api/explain-error` — chosen for fast, low-cost execution and concise plain-language error translations.
- Debounced and cached error explanations in `frontend/src/errorExplainer.js` — error explanations execute exclusively on field blur and section submission rather than per-keystroke to keep API traffic cheap and fast.
- Enforced server-side cross-field consistency checks for `DOB` (Context vs Identity) and `Port of Arrival` (Context vs Visa/Trip) — mismatches block submission until resolved by the applicant.
- Generated synthetic final reference number format `IND-XXXXXX` upon submission — confirms application finalization while keeping numbers human-readable and clean.
- Used OpenAI text model `gpt-4o-mini` for `GET /api/status/:finalReferenceNumber` — converts internal status enums into warm, citizen-focused sentences.
- Seeded a synthetic wait-time estimate dictionary mapped by visa type and purpose (Medical: 1-2 days, Business: 2-4 days, Tourist/Default: 3-5 days) — provides immediate, transparent processing timelines without ML overhead.
- Implemented static fallback handling for status explainer — if AI call or network fails, returns `"Your application has been received and is currently being processed by visa authorities."` to prevent status page disruption.
- Completed comprehensive pre-deployment consistency pass — standardized design tokens across components (`var(--civic)`, `var(--line)`), verified disclaimer banner rendering across all views (`shell`, `app`, `resume`, `status`), and confirmed progress rail functionality.
- Aligned the Express section API with the React shell (`POST /api/applications/:tempId/:section`) and made every successful save return the complete application state — this removes the migration-era mismatch that kept “Save and continue” on the same page.
- Stored the active section and completed-section list with each draft, and rebuild the flat frontend state from SQLite on every read — resume now restores both entered data and the correct next step.
- Kept mock OTPs visible only in the demo response and require a successful verification result before the UI advances — this makes the simulated Contact step testable without falsely marking a draft as submitted.
- Used responsive quick-action controls and an adaptive step rail: actions wrap at narrow widths, the rail gains touch-friendly padding, and steps become a grid before collapsing to one column.





