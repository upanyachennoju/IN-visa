# Flow

Current state:
- Backend now supports the Contact slice plus state lookup by `tempId`: saving a draft contact record, generating separate mock OTPs for email and phone, verifying both OTPs, returning a simulated dispatch log plus a generated short `tempId`, and restoring the saved section state for resume.
- Frontend now has a 15-step navigation shell with a clickable progress rail, a `Resume application` entry point, the Contact screen wired into the shell, and placeholder panels for the other 14 sections.
- No other section forms, AI integration, or production delivery providers are implemented yet.
