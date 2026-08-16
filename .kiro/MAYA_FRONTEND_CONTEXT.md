# MAYA Frontend — Project Context

## Overview
MAYA is an AI-powered creator operations assistant. This is the React frontend.
- **Positioning:** "Your creator workspace. All in one place." — NOT an analytics tool, NOT a Hootsuite clone
- **Tech Stack:** React 19 + Vite 6 + TailwindCSS 3.4 + Recharts + react-icons
- **Deployment:** Firebase Hosting (dist/ folder, SPA rewrite) → `https://mayamanage.web.app`
- **Dark mode:** Default dark, togglable to light, stored in localStorage ("maya-theme")
- **Build status:** Passing (all localhost references replaced with production URL)

---

## Architecture

### File Structure
```
src/
├── App.jsx                          # Routes, providers, layout
├── Home.jsx                         # Landing page (dark gradient hero, stacked image, creator-ops messaging)
├── DemoPage.jsx                     # Standalone demo playground (no header/footer from main app)
├── login.jsx / register.jsx         # Auth pages
├── DarkModeToggle.jsx               # Sun/moon toggle, localStorage persistence
├── UserAccountMgnt.jsx              # Account page (profile, connected accounts, usage, weekly reports, settings)
├── ContentGeneration*.jsx           # 6 platform pages (thin wrappers using shared component)
│
├── analytics/
│   ├── CreatorContext.jsx           # React context: auth state, connected accounts, demo creators, selectedCreator
│   ├── AnalyticsDashboard.jsx       # "Improve → Insights" page (4 cards, chart, AI insights, 24+ advanced metrics)
│   ├── AIChatPage.jsx               # Full AI chat page (streaming, markdown, categorized prompts)
│   ├── AIChatPanel.jsx              # Floating chat widget (rate limit handling with cooldown)
│   ├── PhylloConnect.jsx            # Phyllo SDK flow + SyncStatusScreen trigger
│   ├── apiHelper.js                 # getAuthHeaders/getAxiosConfig — conditional Bearer token based on isDemo
│   ├── AISummaryCard.jsx            # AI-generated insight at top of dashboard
│   ├── CollapsibleSection.jsx       # Collapsible wrapper with localStorage persistence
│   ├── useScrollReveal.jsx          # IntersectionObserver hook for fade-in animations
│   ├── HealthScoreCard.jsx          # Animated radial ring + gradient banner
│   ├── RateCards.jsx                # Count-up animation + hover lift + trend border
│   ├── EngagementTrend.jsx          # Dark-themed area chart
│   ├── ContentMix.jsx              # Dark-themed donut chart
│   ├── BestWorstPosts.jsx          # Tabbed post cards (top 5 / bottom 5)
│   ├── BestPostingTime.jsx         # Time card
│   ├── HashtagsTable.jsx           # Tabbed table (most used / top performing)
│   ├── Superfans.jsx               # Gamified leaderboard with medals
│   ├── SentimentChart.jsx          # Emoji-driven sentiment
│   ├── CommonWords.jsx             # Ranked bar list
│   ├── QuestionsInsight.jsx        # Unanswered questions card
│   ├── MostLikedComments.jsx       # Quote cards
│   ├── CTAInsight.jsx              # CTA comparison
│   ├── CaptionLengthInsight.jsx    # Bucket comparison
│   └── QuestionsVsStatements.jsx   # Comparison card
│
├── contentlab/
│   ├── ContentGenerator.jsx         # Shared component for all 6 platforms
│   ├── platformConfigs.js           # All platform configs (fields, options, API endpoints, response parsers)
│   └── CreatePage.jsx              # Platform selection grid (/create route)
│
├── tools/
│   ├── PlanPage.jsx                 # Operations Dashboard (streak, weekly goal, today's focus, plan generator, suggestions)
│   ├── CalendarPage.jsx             # Monthly grid calendar with CRUD modals (past-date prevention)
│   ├── CommentsPage.jsx             # Chat-based comments management
│   └── TrendsPage.jsx              # Chat-based trends
│
├── components/
│   ├── AuthGuard.jsx                # Protects routes (checks JWT, redirects to /login)
│   ├── ConnectAccountGate.jsx       # Blocks tools until social account connected
│   ├── AccountSwitcher.jsx          # Header: react-icons brand logos + profile pic failsafe
│   ├── NotificationBell.jsx         # Bell icon
│   ├── Onboarding.jsx              # 3-step welcome modal
│   ├── PageTransition.jsx          # Opacity fade (NO transform)
│   ├── ErrorBoundary.jsx           # React error catcher
│   ├── NotFound.jsx                # 404 page
│   ├── SkeletonLoader.jsx          # Shimmer loading states
│   ├── ChatPromptGuide.jsx         # Categorized 19-action prompt cards
│   ├── SyncStatusScreen.jsx        # Post-connection sync progress
│   └── WeeklyReports.jsx           # Expandable weekly report cards
│
├── pages/
│   ├── PrivacyPolicy.jsx           # Full privacy policy (14 platforms listed)
│   └── TermsOfService.jsx          # Full terms of service (14 platforms listed)
│
└── tokenDecoder/
    └── detokenizer.js               # JWT utilities
```

---

## Navigation Structure

### Header (Authenticated users):
`Plan | Calendar | Improve | Ask MAYA | Create | Account`

### Public:
- `/` — Homepage
- `/login`, `/register` — Auth
- `/demo` — Demo (standalone, own header)
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service

### Auth-protected:
- `/plan` — Operations Dashboard (default landing for logged-in users)
- `/calendar` — Content Calendar
- `/analytics` — Improve → Insights
- `/chat` — Ask MAYA
- `/create` — Content Lab (platform picker)
- `/ContentGeneration*` — Individual platform pages
- `/comments` — Comment Manager
- `/trends` — Trends & Ideas
- `/UserAccountMgnt` — Account Settings

---

## API Endpoints

### Base URL (ALL endpoints — production):
```
https://maya-backend-service-326007673689.asia-southeast1.run.app
```

### Auth:
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | None | Returns JWT |
| `/auth/registerUser` | POST | None | Register |
| `/auth/getUserById/{id}` | GET | Bearer | User profile |

### Phyllo (Account Connection):
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/phyllo/connect` | POST | Bearer | Initiate Phyllo SDK |
| `/api/phyllo/account-connected` | POST | Bearer | Store connected account |
| `/api/phyllo/accounts?userId=X` | GET | Bearer | List connected accounts |
| `/api/phyllo/disconnect/{creatorId}` | DELETE | Bearer | Soft-disconnect (data preserved) |
| `/api/phyllo/reconnect/{creatorId}` | PUT | Bearer | Instant reconnect |
| `/api/phyllo/disconnected?userId=X` | GET | Bearer | List reconnectable accounts |
| `/api/phyllo/delete-account/{creatorId}` | DELETE | Bearer | PERMANENT deletion (irreversible) |
| `/api/phyllo/sync-status/{creatorId}` | GET | Bearer | Sync progress polling |

### Analytics:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analytics/creators` | GET | Demo creator list |
| `/api/analytics/dashboard/{creatorId}` | GET | Full 24-metric dashboard |
| `/api/analytics/weekly-reports/{creatorId}` | GET | Weekly snapshots |

### Post Activity (for streak + goal):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/posts/activity?creatorId=X` | GET | postDates (90 days), thisWeekCount, totalPosts |

### Weekly Goals:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/goals/current?creatorId=X` | GET | This week's goal (target, weekStart, exists) |
| `/api/goals/set` | POST | Set/update goal (body: { creatorId, target }) |

### AI Chat (SSE streaming):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat/stream` | POST | Streaming chat (body: { message, creatorId, sessionId }) |

### Strategy (Weekly Plan):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/strategy/generate` | POST | Generate 7-day plan (body: { creatorId }) |
| `/api/strategy/generate-and-save` | POST | Generate + save all to calendar |

### Content Calendar:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/schedule/create` | POST | Create scheduled post |
| `/api/schedule/list?creatorId=X` | GET | List posts |
| `/api/schedule/update/{id}` | PUT | Update post |
| `/api/schedule/delete/{id}` | DELETE | Delete post |
| `/api/schedule/approve/{id}` | PUT | Approve post |

### Content Generation (Bearer required):
| Endpoint | Platform |
|----------|----------|
| `/api/content/facebook/fb_prime` | Facebook |
| `/api/content/instagram/insta_prime` | Instagram |
| `/api/content/tiktok/tt_prime` | TikTok |
| `/api/content/youtube/yt_prime` | YouTube |
| `/api/content/snapchat/sc_prime` | Snapchat |
| `/api/content/pinterest/pin_prime` | Pinterest |

---

## Rate Limiting

### Limits enforced by backend:
- AI Chat: 30 messages/minute per session
- Strategy Generate: 10/hour per creator
- Strategy Generate-and-Save: 10/hour per creator (shared bucket)

### Frontend handling:
- **AI Chat:** Detects `[ERROR]` tokens containing "rate limit" → shows error-styled message bubble (red bg), disables input for 5 seconds
- **Strategy Generate:** Catches HTTP 429 → shows toast with backend message, disables Generate/Regenerate buttons for 60s, shows "0 generations remaining"
- **MAYA Suggestions (Plan page):** On rate limit `[ERROR]`, shows "MAYA is taking a breather" + static fallback suggestions
- **MAYA Insights (Improve page):** Same pattern — rate limit shows specific message + falls back to static text

---

## Key Features & Patterns

### Plan Page (`/plan`) — Operations Dashboard:
1. **Welcome Header** — greeting + active account indicator
2. **Posting Streak** — computed from real Phyllo-synced post dates (`/api/posts/activity`)
   - Consecutive days with published posts going backwards from today
   - Shows current streak + longest streak all-time
   - Dynamic emoji (✨ < 3 days, ⚡ 3-6 days, 🔥 7+ days)
3. **Weekly Goal** — progress ring + slider setter
   - Fetches from `/api/goals/current`, saves to `/api/goals/set`
   - Progress = `thisWeekCount` from `/api/posts/activity` (real posts, NOT calendar drafts)
   - SVG circular progress ring, turns green at 100%
4. **Today's Focus** — shows ALL posts scheduled today (stacked by time, sorted ascending)
   - Uses local timezone (`getFullYear/getMonth/getDate`) not `toISOString()`
5. **Summary Cards** — next post, content ready, platforms, this week
6. **Weekly Plan Generator** — AI-powered 7-day content plan with day cards, edit, save to calendar
7. **MAYA Suggestions** — AI-generated operational tips with static fallback on error
8. **Upcoming Schedule Preview** — next 4 posts with platform icons
9. **Quick Ask** — links to /chat with suggested prompts

### Calendar Page (`/calendar`):
- Monthly grid with posts shown per day
- **Past dates:** Cannot open drafts (dimmed, opacity-60, cursor-not-allowed, no click handler)
- **Time validation:** `min` attribute on datetime-local uses local time, `handleSave` checks `scheduledDate <= now` (exact minute, not just date)
- **`formatDate`** uses `getFullYear/getMonth/getDate` (NOT toISOString — timezone fix)

### Insights Page (`/analytics`):
- 4 operational insight cards (posting consistency, followers, best engagement window, ER)
- Engagement trend chart
- AI Insights panel with `[ERROR]` token detection + static fallback
- Advanced Metrics: collapsible accordion with 24+ metrics
- **Metrics Explanation Modal:** Detailed descriptions for all 24 metrics with formulas, benchmarks, and actionable context (sourced from analytics reference document)

### Account Page (`/UserAccountMgnt`):
- Profile details, connected accounts, usage & plan, weekly reports, settings
- **Connected accounts:** Disconnect + Delete buttons per account
- **Disconnected accounts:** Reconnect + Delete (permanent) buttons
- **Delete confirmation modal:** Must type "DELETE", shows warning, irreversible
- **Usage & Plan:** Free tier only (no Upgrade button), shows $0, all features with ✓, unlimited (∞) usage during early access

### Homepage (`/`):
- Dark gradient hero: "Your creator workspace. All in one place."
- Stacked image below text (max-w-[850px])
- "Get Started Free" → `/plan` if logged in, `/register` if not
- "Connect My Account" → same logic

### Light Mode Card Visibility (index.css):
- `border-gray-100` upgraded globally to `gray-300` (#d1d5db)
- Subtle box-shadows on white rounded cards
- Hover lift effect
- All reset in dark mode

### Profile Picture Failsafe:
- Phyllo returns signed URLs that expire
- `onError` handler on `<img>` falls back to platform icon (react-icons: FaInstagram, FaFacebook, etc.)
- Gradient-filled icon containers on summary cards

### SSE Stream Error Handling:
- `[ERROR]` token detection in all SSE consumers (chat, suggestions, insights)
- Rate limit errors → specific UI treatment (cooldown, fallback messages)
- Generic errors → static fallback suggestions/insights

### Auth:
- JWT-based, stored in `sessionStorage`
- No guest login (removed entirely)
- Demo page serves trial purpose instead
- `AuthGuard` redirects unauthenticated users to `/login`
- `ConnectAccountGate` blocks analytics/tools until Phyllo account connected

---

## Technical Decisions

| Decision | Chosen | Rejected |
|----------|--------|----------|
| Positioning | AI creator operations assistant | Analytics tool / Hootsuite clone |
| Default landing | `/plan` | `/analytics` |
| Guest login | Removed (demo page instead) | Limited guest trial |
| Hero layout | Stacked (image below) | Side-by-side (image too small) |
| Hero image size | max-w-[850px] | 1100px (too large) / 520px (too small) |
| Dark mode cards | gray-900/gray-800 | Pure black |
| Calendar date format | Local time methods | `toISOString()` (timezone shift) |
| Scheduling send | Raw datetime string | `tzOffset` calculation (off-by-one) |
| Platform icons | react-icons (FaInstagram etc.) | Text abbreviations ("IG"/"FB") |
| Icon style | Gradient-filled containers | Flat colored text |
| Streak/Goal data source | Real Phyllo-synced posts (`/api/posts/activity`) | Calendar/scheduled posts |
| Weekly goal storage | Backend (`/api/goals/set`) | localStorage (cross-browser issue) |
| Light mode borders | gray-300 + box-shadow | gray-100 (invisible) / gray-200 (too subtle) |
| Rate limit UX | Error bubbles + cooldown + fallback | Silent failure |

---

## What's NOT Done Yet (Parked):
1. Mobile responsive polish
2. Real notification system
3. Content history / saved generations
4. Email digest integration
5. Color system change from teal (user mentioned "not bound to teal")
6. Backend: fix profile picture expiration (download and serve from own storage)
7. Backend: fix OpenAI tool_calls memory issue causing `[ERROR]` in insights
8. End-to-end test: register → login → connect → sync → plan → schedule → chat → disconnect/delete
9. Code-splitting (bundle is 1.1MB — consider lazy loading routes)

---

## Important Notes:
- `PageTransition` uses ONLY opacity (no transform — breaks `position: fixed`)
- Onboarding modal: localStorage "maya-onboarded"
- Demo tour: localStorage "maya-demo-toured"
- Collapsible sections persist in localStorage
- `index.css` global overrides handle dark mode for pages without explicit `dark:` classes
- Phyllo SDK: `https://cdn.getphyllo.com/connect/v2/phyllo-connect.js` (loaded in index.html)
- Recharts v2.15.3 for charts
- react-markdown for AI chat responses
- @tailwindcss/typography for prose classes
- `sessionId` (crypto.randomUUID()) sent with all chat requests
- Creator IDs are DYNAMIC — never hardcode them
- `apiHelper.js` conditionally adds Bearer based on `isDemo` flag
- Privacy Policy at `/privacy`, Terms of Service at `/terms` — both list 14 platforms
- All `localhost` references have been replaced with production Cloud Run URL
