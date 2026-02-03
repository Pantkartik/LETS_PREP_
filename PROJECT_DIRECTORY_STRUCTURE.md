# Project Directory Structure

```
pantkartik-lets_prep_/
├── README.md
├── CHANGELOG.md
├── COMPETITION_IMPLEMENTATION_GUIDE.md
├── CONTRIBUTING.md
├── FEATURES_IMPLEMENTED.md
├── GIT_WORKFLOW.md
├── LETS_PREP_PRD.md
├── LICENSE
├── PROFILE_ERROR_FIX.md
├── QUICK_SETUP.md
├── SECURITY.md
├── SETTINGS_SETUP.md
├── setup-competitions.ps1
├── UI_UX_IMPROVEMENTS.md
├── URGENT_FIX_PROFILE.md
├── Backend/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── package.json
│   ├── PROJECT_STRUCTURE.md
│   ├── QUICK_REFERENCE.md
│   ├── SETUP.md
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── code-executor.ts
│       ├── server.ts
│       ├── config/
│       │   ├── cors.ts
│       │   ├── logger.ts
│       │   ├── rateLimit.ts
│       │   └── supabase.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── battle.controller.ts
│       │   ├── problem.controller.ts
│       │   ├── submission.controller.ts
│       │   ├── tournament.controller.ts
│       │   └── user.controller.ts
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── errorHandler.ts
│       │   ├── notFoundHandler.ts
│       │   └── validation.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── battle.routes.ts
│       │   ├── executor.routes.ts
│       │   ├── problem.routes.ts
│       │   ├── submission.routes.ts
│       │   ├── tournament.routes.ts
│       │   └── user.routes.ts
│       ├── services/
│       │   ├── codeExecution.service.ts
│       │   └── redis.service.ts
│       ├── sockets/
│       │   └── index.ts
│       └── validators/
│           ├── auth.validator.ts
│           ├── battle.validator.ts
│           ├── problem.validator.ts
│           ├── submission.validator.ts
│           ├── tournament.validator.ts
│           └── user.validator.ts
├── Frontend/
│   ├── AUTHENTICATION_SETUP.md
│   ├── BACKEND_AUTH_FIX.md
│   ├── BACKEND_SETUP.md
│   ├── check-supabase.js
│   ├── CODE_EXECUTION_GUIDE.md
│   ├── components.json
│   ├── DESIGN_IMPROVEMENTS.md
│   ├── EMAIL_QUICK_SETUP.md
│   ├── EMAIL_README.md
│   ├── EMAIL_SETUP_SUMMARY.md
│   ├── EMAIL_VERIFICATION_DISABLED.md
│   ├── FEATURES.md
│   ├── FIX_LOCALHOST_ERROR.md
│   ├── middleware.ts
│   ├── MULTI_LANGUAGE_COMPLETE.md
│   ├── MULTI_LANGUAGE_GUIDE.md
│   ├── next.config.mjs
│   ├── package.json
│   ├── PERFORMANCE_OPTIMIZATIONS.md
│   ├── pnpm-lock.yaml
│   ├── postcss.config.mjs
│   ├── prisma.config.ts
│   ├── QUICK_START.md
│   ├── README_SUPABASE.md
│   ├── SETUP_SUMMARY.md
│   ├── SUPABASE_EMAIL_SETUP.md
│   ├── SUPABASE_SETUP.md
│   ├── TESTING_GUIDE.md
│   ├── tsconfig.json
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── ... (Supabase/NextAuth Helpers)
│   │   ├── auth/
│   │   │   └── ... (Auth pages)
│   │   ├── battles/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── classes/
│   │   │   └── ...
│   │   ├── competitions/
│   │   │   └── ...
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── interviews/
│   │   │   └── page.tsx
│   │   ├── join/
│   │   │   └── page.tsx
│   │   ├── leaderboards/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── problems/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── teacher*/
│   │       └── ... (Teacher Dashboards)
│   ├── components/
│   │   ├── ... (UI Components, ShadCN, Custom)
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── code-executor.ts
│   │   ├── supabase-client.ts
│   │   ├── supabase-server.ts
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   ├── actions/
│   │   │   └── ... (Server Actions)
│   │   └── hooks/
│   │       └── use-user-profile.ts
│   ├── scripts/
│   │   └── ... (Seeding/Scraping)
│   ├── styles/
│   │   └── globals.css
│   └── supabase/
│       ├── ... (SQL Migrations & Policies)
└── .github/
    └── pull_request_template.md
```
