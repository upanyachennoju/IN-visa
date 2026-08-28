# Decisions

- Primary civic tone: navy — fits a formal public-service feel while staying clear under the flat-color constraint.
- Used Maven + Spring Boot Data JPA + H2 with `create-drop` — the simplest hackathon-friendly persistence scaffold with no migrations.
- Used a single nested `Application` entity file — keeps the requested structure grouped without adding extra domain classes.
- Used Vite + `react-router-dom` for the frontend shell — provides the requested placeholder route with minimal setup.
- Primary civic hex confirmed: `#102a43` — keeps the flat UI in the agreed navy tone.
- Added a hidden internal numeric database id plus a public short `tempId` — this lets the draft persist before OTP verification while still generating the requested short reference only after both OTPs pass.
- Used direct `http://localhost:8080` API calls from the browser — simplest path for this single-screen prototype with simulated delivery.
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

