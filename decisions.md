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
