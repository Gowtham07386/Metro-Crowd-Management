# MetroFlow — Smart Metro Management System

A premium, enterprise-grade frontend for a metro management platform, built
frontend-only with realistic mock data structured for an easy backend swap
later.

## Flow

```
Login → Continue As (Passenger / Administrator) → Select Metro City → Dashboard
```

- Role and selected city persist to `localStorage` and drive every page —
  switching city via the navbar's "Change City" button regenerates all data.
- Auth is mocked with `localStorage`. Demo login:
  **demo@metroflow.app** / **MetroFlow@123**

## Tech stack

React 18 + Vite · Tailwind CSS · React Router DOM v6 · Framer Motion ·
Recharts · React Hook Form + Zod · React Toastify · Lucide React · Context API

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```
src/
├── components/
│   ├── common/       # Button, Input, Card, Modal, Table, Badge, CountUp...
│   ├── passenger/     # Sidebar, Navbar, MetroLineDiagram, StationDetailModal
│   ├── admin/          # Sidebar, Navbar
│   ├── modals/          # HighCrowdAlert, ChangeCityModal
│   ├── charts/           # Recharts wrappers (area/bar/line/donut), ProgressBar
│   └── auth/              # Route guards (RequireAuth, RequireRoleAndCity...)
├── layouts/             # PassengerLayout, AdminLayout
├── pages/
│   ├── auth/             # Login, RoleSelect, CitySelect
│   ├── passenger/         # Dashboard, JourneyPlanner, LiveCrowd, MetroMap...
│   └── admin/              # Dashboard, Analytics, LiveMonitoring, Stations...
├── context/              # AuthContext, AppContext (role + city)
├── services/              # authService.js (mock backend)
├── data/                   # cities.js (10 city metadata) + cityDataGenerator.js
├── hooks/                   # useAuth, useApp, useCityData, useDisclosure
├── routes/                   # AppRoutes.jsx
├── constants/                 # ROUTES, ROLES, crowd status helpers
└── utils/                      # cn.js, formatters.js (incl. seeded RNG)
```

## Mock data model

`src/data/cities.js` holds static metadata for 10 metro cities (station
count, line count, daily passengers). `src/data/cityDataGenerator.js`
deterministically generates a full dataset per city — stations, trains,
hourly/weekly/monthly ridership, risk rankings, alerts, and an AI
prediction block — seeded off the city id, cached per city, and instantly
swapped whenever the selected city changes.

## Connecting a real backend later

Swap the body of `src/services/authService.js` for real HTTP calls, and add
sibling services (e.g. `stationService.js`) that fetch from your backend
instead of calling `generateCityData()`. Pages consume data through
`useCityData()` / `useApp()`, so no component needs to change — only the
hook's data source does.

## Notes

- No Notifications or Settings entries in either sidebar, per spec — alerts
  surface as an auto-dismissing "High Crowd Alert" popup instead.
- The Metro Map is a schematic SVG line diagram (like a real transit map)
  rather than a geographic map, so it works identically for all 10 cities
  without needing real station coordinates.
- Report export buttons are UI-only placeholders, as requested.

## Recent additions (auth, profile, settings)

- **Login** is now a full-screen animated illustration (skyline, moving
  train, glowing gradients) with a centered glassmorphism popup for
  sign-in, plus a "Create New Account" popup (back arrow returns to sign-in
  without logging the new account in — matches the requested flow).
- **Continue As** now has a top-left Back button (signs out and returns to
  Login) and gates **Administrator** behind an Employee ID + phone OTP
  check before the role is set. Demo OTP: `123456`.
- **Profile** (`/passenger/profile`, `/admin/profile`) and **Settings**
  (`/passenger/settings`, `/admin/settings`) are new shared pages reachable
  from a profile dropdown in both navbars (My Profile / Settings / Logout).
  Editing a profile (name, phone, email, photo) persists via
  `authService.updateUserProfile`.
- Settings includes Change Password, Notification toggles, a Dark/Light
  mode toggle, Language selection, Privacy toggles, About, and Logout. The
  dark mode toggle is functional and persists, but — intentionally, to
  avoid a full redesign — existing dashboard pages don't yet have `dark:`
  styling applied; that can be extended page-by-page later.

No existing dashboard, sidebar nav, or page logic was changed — only the
navbars' profile menu, the Login page, and the Continue As page were
touched, plus the new Profile/Settings pages and their routes.

## Landing page & administrator re-verification (latest update)

- **`/` now renders a full Landing Page** instead of redirecting to
  `/login` — hero section (reuses `LoginBackground`), a public read-only
  Dashboard Preview (sample KPI cards + station table), a Live Notification
  panel (session-only dismiss), an About section, and a Contact footer.
  Nav links (Home/About/Features/Contact) smooth-scroll to sections.
- **Sign In / Sign Up** on the Landing page opens the same
  `AuthenticationModal` / `CreateAccountModal` as a blurred overlay —
  no route change, Landing stays visible behind it. `/login` still works
  standalone if visited directly.
- **Continue As → Back** now returns to the Landing Page (signs out first).
- **Administrator verification is now a 3-step flow** (`AdminOTPModal`):
  Select Metro Station → Employee ID + registered phone → OTP. On success
  it sets city + role together and goes straight to the Admin Dashboard —
  admins no longer pass through the plain passenger city picker.
- **Changing city as an admin** (navbar "Change City") now re-runs the
  same 3-step verification for the new city, instead of a simple confirm
  dialog — enforced by `AdminNavbar`, and as defense-in-depth, the
  `RequireRoleAndCity` guard now sends an admin with no verified city back
  through Continue As rather than the passenger city picker.
- Passenger flow (city picker, simple "Change City" confirm) is
  unchanged, per spec.
