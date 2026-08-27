# Changelog

## 2026-08-27
- Step 0: Created the tracking files required for the VisaFlow build session.
- Files touched: `changelog.md`, `decisions.md`, `flow.md`

## 2026-08-27
- Step 1: Scaffolded the backend Spring Boot project, added the nested `Application` entity, configured H2 auto-ddl, and created the minimal React shell with a single `/` route.
- Files touched: `backend/pom.xml`, `backend/src/main/java/com/visaflow/VisaFlowApplication.java`, `backend/src/main/java/com/visaflow/application/Application.java`, `backend/src/main/resources/application.properties`, `frontend/package.json`, `frontend/index.html`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/styles.css`

## 2026-08-27
- Step 2: Implemented the Contact-only backend flow with draft save, independent email/phone OTP generation, verification, and mock dispatch output; replaced the frontend shell with a single Contact screen.
- Files touched: `backend/src/main/java/com/visaflow/application/Application.java`, `backend/src/main/java/com/visaflow/contact/ContactApplicationRepository.java`, `backend/src/main/java/com/visaflow/contact/ContactApplicationService.java`, `backend/src/main/java/com/visaflow/contact/ContactController.java`, `backend/src/main/java/com/visaflow/contact/ContactDtos.java`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/styles.css`

## 2026-08-27
- Step 3: Added the 15-section navigation shell, the tempId resume entry point, backend application-state lookup by tempId, and wired the existing Contact screen into the shell.
- Files touched: `backend/src/main/java/com/visaflow/application/Application.java`, `backend/src/main/java/com/visaflow/application/ApplicationStateController.java`, `backend/src/main/java/com/visaflow/application/ApplicationStateDtos.java`, `backend/src/main/java/com/visaflow/contact/ContactApplicationService.java`, `backend/src/main/java/com/visaflow/contact/ContactDtos.java`, `frontend/src/App.jsx`, `frontend/src/styles.css`

## 2026-08-27
- Step 4: Added save-and-continue form UIs and backend save endpoints for Application Context, Identity, and Passport, plus the shared section-state response shape used by the shell and resume flow.
- Files touched: `backend/src/main/java/com/visaflow/application/Application.java`, `backend/src/main/java/com/visaflow/application/ApplicationSectionController.java`, `backend/src/main/java/com/visaflow/application/ApplicationSectionDtos.java`, `backend/src/main/java/com/visaflow/application/ApplicationSectionService.java`, `backend/src/main/java/com/visaflow/application/ApplicationStateController.java`, `backend/src/main/java/com/visaflow/application/ApplicationStateDtos.java`, `backend/src/main/java/com/visaflow/contact/ContactApplicationService.java`, `backend/src/main/java/com/visaflow/contact/ContactDtos.java`, `frontend/src/App.jsx`, `frontend/src/styles.css`
