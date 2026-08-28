# Flow

Current state:
- Backend Express server (`backend/server.js`) stores a draft and its section payloads in SQLite. Application Context creates the `tempId`; each later save uses `POST /api/applications/:tempId/:section`, marks that section complete, and returns the next section plus the complete flat application state.
- `GET /api/applications/:tempId` uses the same state shape, so `#/app/{tempId}` resumes data and navigation consistently. Contact uses simulated OTPs; only a successful verification advances the flow to Address.
- Final review reads the saved flat state, reconstructs its section summary, then calls `POST /api/applications/:tempId/submit`. The generic save handler explicitly passes this route through so submission is reachable.
- The 15-step frontend includes plain-language error explainers, document quality checking, final status tracking, and responsive Resume/Check Status actions and step navigation.
- Validation completed on 2026-08-28: backend syntax check, frontend production build, persisted save/resume flow, ordered section saves, and final submission against an isolated test database.





