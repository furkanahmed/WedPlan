# WedPlan — agent.md (Assignment 9, Category 004)

## Token-saving rules (follow always)
- Read agent.md once per task. Do NOT re-read the PDF; agent.md already contains the requirements.
- Open only files you need for the current task. Do not scan or list the whole project, node_modules, .next, or lockfiles.
- Edit with small targeted changes. Never rewrite a whole file for a small change.
- Do not run npm install, build, or lint unless the task needs it. Run one check at the end, not after every edit.
- Do not open a browser or visit external websites unless I ask.
- No long explanations. Final reply: max 8 lines (files changed, what to test, any blocker).
- Do not paste code back in your reply. Do not repeat what I already know.
- Do only the milestone/task I name. Do not start the next one. If something is unclear, ask ONE short question instead of guessing.
- Use shadcn/ui and Tailwind classes; do not write custom CSS unless needed.
- If an error repeats twice, stop and report the exact error instead of trying many variations.
- Never read or print .env files or secrets.

Role-based wedding marketplace. Customer / Vendor / Admin.
Two separate Git repos: frontend [furkanahmed/WedPlan](https://github.com/furkanahmed/WedPlan) and backend [furkanahmed/wedplan-server](https://github.com/furkanahmed/wedplan-server). Push changes only when the owner explicitly asks.

## 0. Working rules (MUST follow)
1. Do NOT guess. Before writing Better Auth / Stripe / MongoDB code, check the installed version's official docs.
2. Work one milestone at a time. Stop after each milestone and wait for the owner's approval.
3. Keep it simple. Owner is a junior-mid developer. Prefer the simplest solution that satisfies the PDF.
4. Commits: small, meaningful, descriptive (client 20+, server 12+). No junk commits.
5. Never commit `.env`. Only `.env.example` with placeholders.
6. Use PDF field names exactly. All status values lowercase.
7. Anything added beyond the PDF must be listed in README ("Extra decisions").
8. Never use `alert()`. Use toasts. Show loading, empty and error states.

## 1. Stack
Next.js (JS), ShadCN, Tailwind, Framer Motion, Better Auth (in Next.js), Express.js, MongoDB, Stripe Checkout (test, subscription mode), ImgBB (file upload), `jose` (JWT/JWKS verify in Express).

## Design System
- Colors: primary `#B76E79`, secondary `#6D2946` (footer/headings only), accent `#D8B36A` (premium badge only), background `#FFFDF9`, text `#1F2937`, border `#E9DED5`.
- Heading sizes: H1 44-56px, H2 32-36px, card title 18-20px, body 16px.
- Navbar: sticky with light blur.
- Sign In and Sign Up inputs: 48px tall (`h-12`).
- Google auth buttons on both forms use the same branded style and show a loading state while pending.
- No dark mode.
- No pagination unless time remains.
- Broken images and invalid services show a fallback UI.

## 2. Auth architecture
- Better Auth lives in Next.js only (email/password + Google). Configure the Better Auth model/collection name as `users` (verify the installed version's adapter configuration) via `additionalFields`: `role`, `isBlocked`, `businessName`, `stripeCustomerId`, `subscriptionPlan`, `subscriptionExpiresAt`.
- Better Auth JWT plugin: client gets token via `authClient.token()`, sends `Authorization: Bearer <token>` to Express.
- Express verifies signature + expiry with `jose` (`createRemoteJWKSet`, `jwtVerify`). Get real `iss`/`aud` by decoding a REAL token first; never guess.
- On EVERY protected request: take user id from `sub`, load user from DB, check current `role` and `isBlocked`. Never trust role from token or client.
- Invalid/expired token -> 401. Blocked or wrong role -> 403.
- Ownership checked on server for every update/delete.
- Sign-up: role only `vendor` or `customer`. A hook rejects/forces `customer` if `admin` or missing. Vendor needs `businessName`.
- On the Sign Up form, selecting `vendor` hides the "Sign up with Google" button and shows "Vendor accounts are created with email and password"; Google button is shown only when `customer` is selected. Google sign-up always creates role `customer`.
- Password field shows a live checklist for min 6 characters, 1 uppercase, and 1 lowercase; each met rule turns green, submit stays disabled until all pass, and password rules are validated again on the server.
- Vendor sign-up requires Business Name, with server-side validation.
- After Sign In, redirect back to the originally requested page.
- Google sign-up: role = `customer` (PENDING OWNER CONFIRMATION, see §9).
- Profile update must accept only `name`, `image`, and `businessName`; server ignores `role`, `isBlocked`, `subscriptionPlan`, `subscriptionExpiresAt` (also block them via `databaseHooks.user.update.before`).
- Admin: created only by `scripts/seed-admin.js` reading `ADMIN_EMAIL` / `ADMIN_PASSWORD` from env. Idempotent; run it against the live production database before submission.
- Admin block/unblock and Stripe webhook updates use direct MongoDB driver on the server.

## 3. Collections
Better Auth `users` + business collections `services`, `bookings`, `transactions`.

services: vendorId, serviceName, category, description, price, location, images[], status (`pending|approved|rejected`, default pending), isActive (vendor availability toggle; extra field), createdAt
bookings: serviceId, vendorId, customerId, eventDate, eventLocation, message, status (`pending|accepted|rejected|cancelled`, default pending), createdAt
transactions: vendorId, plan, amount, currency, stripeSessionId (unique), stripeSubscriptionId, status, createdAt

Indexes: services text index (serviceName, description, category, location), services `{status, isActive}`, bookings `serviceId+eventDate`, `customerId`, `vendorId`.

## 4. Business rules
- Public pages show only `status: "approved"` AND `isActive: true`. Rejected never visible.
- Blocked users see a clear "Account blocked" message in the UI.
- Free vendor: max 3 ACTIVE services (count `isActive: true`). Premium: unlimited.
- Premium check (server): `subscriptionPlan === "premium"` AND `subscriptionExpiresAt > now`.
- If premium expires: nothing deleted/deactivated; vendor cannot activate more until active count <= 3.
- Booking: customer only; vendor cannot book own service; admin cannot book; service must be approved+active.
- Duplicate: before insert, reject if a booking with same `serviceId` + `eventDate` and status `pending` or `accepted` exists.
- Only `pending` bookings can be accepted/rejected (once). Customer can cancel only own `pending` booking. Vendor only handles bookings of own services.
- Transactions: read-only for admin (no update/delete API).
- Admin manages users (search name/email, filter role, block/unblock), services (approve/reject/change status/delete), views transactions.

## 5. Stripe (keep simple)
- `POST /payments/checkout` (vendor only): vendorId from verified JWT+DB (never body). Put `vendorId` in session `metadata` and `subscription_data.metadata`. Reject if already premium.
- Redirect to Stripe -> success/cancel pages. Success page NEVER activates premium.
- Payment Success page re-checks subscription status every few seconds for up to ~30 seconds; the webhook may be late, but the page must never activate Premium itself.
- Webhook `POST /webhooks/stripe`: route registered BEFORE `express.json()` with `express.raw({type:"application/json"})`. Verify signature.
  - `checkout.session.completed`: save `stripeCustomerId`, retrieve subscription, set premium + `subscriptionExpiresAt` from Stripe `current_period_end` (check field path for installed SDK; never add 30 days manually), insert transaction (unique `stripeSessionId` prevents duplicates; handle Mongo error 11000 as already processed).
  - `invoice.paid`: retrieve/update `subscriptionExpiresAt` from Stripe `current_period_end` (check the installed SDK field path).
  - `customer.subscription.deleted`: set plan back to `free`.
- Customer Portal is REQUIRED: `POST /payments/portal` creates a Stripe Customer Portal session for cancellation; the Subscription page has a "Manage Subscription" button.

## 6. API (Express, base `/api/v1`)
Public: GET /services (search, category, location, sort price asc/desc, done in DB query), GET /services/:id
Auth: GET /users/me, PATCH /users/me (accept name, image, businessName only; ignore/forbid role, isBlocked, subscriptionPlan, subscriptionExpiresAt)
Vendor: POST/PATCH/DELETE /services, GET /vendor/overview, GET /vendor/bookings, PATCH /bookings/:id/status
Customer: POST /bookings, GET /bookings/my, PATCH /bookings/:id/cancel, GET /customer/overview (total, pending, accepted, rejected; no cancelled)
Payments: POST /payments/checkout, GET /payments/subscription, POST /payments/portal
Webhook: POST /webhooks/stripe
Admin: GET /admin/overview, GET /admin/users, GET /admin/users/:id, PATCH /admin/users/:id/block, GET /admin/services, PATCH /admin/services/:id/status, DELETE /admin/services/:id, GET /admin/transactions
Validate all input server-side. Return 401/403/404/400 properly.

## 7. Frontend requirements (from PDF)
- Navbar (WedPlan; public: Home, Browse Services, Sign In, Sign Up; logged in: profile dropdown with name+image, Dashboard, Profile Settings, Logout; updates instantly on auth change). Footer (logo+description, links, contact, socials, copyright).
- Home: banner + single CTA "Explore Wedding Services", Featured Services (6 from DB, approved+active, 3-column grid: 1 column mobile, 2 columns tablet), 6 Categories (Photography & Videography, Wedding Venues, Decoration & Florist, Catering Services, Makeup & Styling, Wedding Fashion), exactly one extra section "How WedPlan Works", Framer Motion.
- Home category cards link to Browse Services with the selected category preselected.
- Browse: cards, search by name, category + location filter, price sort, loading + empty states. View Details unauthenticated -> redirect to Sign In.
- `/services/[id]`: private; multiple images, booking form (eventDate, eventLocation, message); invalid id -> error message.
- Redirect unauthenticated users on `/services/[id]` to Sign In.
- Dashboards (sidebar layout, role-based): Vendor (Overview, My Services, Add Service, Booking Requests, Subscription, Profile), Customer (Overview, My Bookings, Profile), Admin (Overview, Manage Users, Manage Services, Transactions). Wrong-role URL access blocked (client redirect + server check); wrong-role dashboard URLs redirect to the user's own dashboard.
- Vendor Overview response fields: `totalServices`, `activeServices`, `pendingRequests`, `acceptedBookings`, `currentPlan`; Admin Overview response fields: `totalUsers`, `totalVendors`, `totalCustomers`, `totalServices`, `pendingServices`, `totalTransactions`.
- Show the Premium Vendor Badge on the Subscription page and on premium vendor service cards/details.
- Add Service form supports multiple images as an `images[]` array.
- Pages: Sign In, Sign Up (name, email, password, optional image via ImgBB, role), Payment Success, Payment Cancel. Password: min 6, 1 upper, 1 lower.
- Payment Success, Subscription, and profile image uploads use server-side ImgBB upload through a Next.js route or Express; failed image uploads show a toast error.
- Responsive, ShadCN, no reload/404 on refresh, auth persists.
- Express: add a 404 handler; Next.js: add a not-found page.

## 8. Env (names only)
Server: PORT, NODE_ENV, MONGODB_URI, DB_NAME, CLIENT_ORIGIN, BETTER_AUTH_JWKS_URL, JWT_ISSUER, JWT_AUDIENCE, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID, ADMIN_EMAIL, ADMIN_PASSWORD
Server: IMGBB_API_KEY
Client: NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, MONGODB_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
CORS: exact `CLIENT_ORIGIN`, `credentials: true`, never `*`.

## 9. Open items (do not assume; ask owner)
- Google sign-up role: default `customer` (option A) vs role picker before Google (option B). Recommended: A.
- Does a pending service count toward the free 3 limit? Current default: count only `isActive: true`.
- Requirement video (B14-A9_category-004.mp4) not seen. Owner to note any extra instructions.
- Premium price/duration: owner's choice (e.g. $9/month), document in README.

## 10. Milestones
1 Setup both repos, .gitignore, .env.example, Mongo connection
   - [x] Two separate repos: frontend/client and backend/server setup
   - [x] Basic Express server and Next.js app setup
   - [x] `.gitignore` configured
   - [x] `.env.example` for both repos
   - [x] MongoDB connection and startup configuration
   - Status: **Done**
2 Express middleware (JWT verify, DB role/block check, error handler)
   - Status: **Done**
3 Next.js foundation (layout, navbar, footer, theme, toasts)
   - Status: **Done**
4 Auth (sign up/in, Google, role rules, admin seed, redirects, route protection)
   - 4A: **Done** (Better Auth foundation, commit c558290)
5 Public site (home, browse, search/filter/sort, details)
6 Vendor dashboard + service CRUD + limits + bookings
7 Customer dashboard + booking + cancel + profile
8 Admin dashboard
9 Stripe (checkout, webhook, subscription page)
10 Testing, deploy (Vercel + Render/Railway), README (name, features, stack, install, run, live link, both repo links), submission (admin email/password, live link, repos, test notes)

## 11. Repo structure
Server: `src/{config,middleware,modules,routes,utils,webhooks}`, `scripts/seed-admin.js`, `app.js`/`server.js`
Client: `src/app/{api/auth,(auth),dashboard}`, `src/components`, `src/lib/{auth-client.js,api.js}`, `src/hooks`

## 12. Verify during implementation
Better Auth hook signatures and provider detection; JWT `iss`/`aud`; Stripe `current_period_end` path for installed SDK.
