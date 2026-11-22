# WedPlan Client

WedPlan is a wedding planning marketplace where customers book wedding services,
vendors publish services and manage booking requests, and admins moderate the
platform. This repository is the **client** application, built with Next.js.

## Features

### Customer

- Browse approved and available wedding services.
- Search by name, filter by category and location, and sort by price.
- View service details and submit booking requests.
- Cancel pending bookings from the customer dashboard.
- View booking summary counts, all bookings, and profile settings.

### Vendor

- Role-based vendor dashboard with overview statistics.
- Create, edit, and delete services, including multiple service images.
- Toggle service availability with the `isActive` field.
- Free plan allows up to three active services; Premium removes the limit.
- Review booking requests and accept or reject pending requests.
- Subscribe to Premium through Stripe Checkout and manage the subscription
  through the Stripe Customer Portal.
- Update vendor profile details, including business name and profile image.

### Admin

- Admin dashboard with platform overview counts.
- Search and filter users, then block or unblock accounts.
- Review services and approve, reject, or change their status; delete services.
- View subscription transactions in a read-only list.

### Shared

- Email/password authentication and Google sign-in for customers.
- Role-based dashboards and protected routes.
- Image uploads through ImgBB.
- Premium Vendor badge on subscription and service views.
- Responsive layouts built with Tailwind CSS and ShadCN UI.

## Technology Stack

Versions are taken from `package.json`.

- Next.js `16.4.6`
- React `19.3.0` and React DOM `19.3.0`
- Tailwind CSS `4.3.3`
- ShadCN `4.23.0`
- Better Auth `1.7.26` with the MongoDB adapter `1.7.26`
- MongoDB Node.js driver `6.22.0`
- Framer Motion `14.14.0`
- Sonner `2.0.8`
- Lucide React `1.76.0`
- ESLint `9` with `eslint-config-next` `16.4.6`

## Live Website

https://wed-plan-7c5o.vercel.app

## Repositories

- Client: https://github.com/furkanahmed/WedPlan
- Server: https://github.com/furkanahmed/wedplan-server
- Live API: https://wedplan-server-liart.vercel.app

## Installation and Local Development

Clone the client repository and install dependencies:

```bash
git clone https://github.com/furkanahmed/WedPlan.git
cd WedPlan
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead.

Fill in the variable names below in `.env.local`. Do not commit this file.

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `IMGBB_API_KEY`

`IMGBB_API_KEY` is used by the server-side upload route and must remain private.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Extra Decisions

These decisions go beyond the assignment PDF:

- Google sign-in always creates a Customer account. Vendors register with email
  and password.
- Services include an extra `isActive` field so vendors can control availability.
- Premium is activated only by a verified Stripe webhook.

## Testing the App

1. Register a vendor account and add a service.
2. Sign in as an admin and approve the service.
3. Register a customer account and submit a booking for the approved service.
4. Sign in as the vendor and accept the booking request.
5. Open the vendor Subscription page and complete Stripe Checkout in test mode
   with card `4242 4242 4242 4242`.
