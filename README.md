UZYNTRA UI is the operator dashboard for the UZYNTRA Rust API security gateway. It provides a professional control plane for monitoring security events, reviewing audit history, managing active mitigations, inspecting source reputation, and editing live policy settings.

## Features

- Dashboard with live operator metrics
- Events explorer with filtering and detail inspection
- Active mitigations management
- Source reputation review and reset actions
- Audit trail viewer
- Policy management for:
  - global rule modes
  - route overrides
  - route rate-limit overrides
- UZYNTRA product branding and control console layout

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Browser-based admin API integration with the Rust backend

## Backend requirement

The Rust admin API must be running on:

`127.0.0.1:9090`

The current UI expects the admin token:

`dev-admin-token-1`

## Run locally

```bash
npm install
npm run dev
````

Then open:

`http://localhost:3000`

## Key Pages

* `/` Dashboard
* `/events` Events Explorer
* `/mitigations` Mitigations
* `/reputation` Reputation
* `/audits` Audit Trail
* `/policy` Policy Management

## Project Structure

```text
src/
 ├── app/
 │    ├── page.js
 │    ├── events/page.js
 │    ├── mitigations/page.js
 │    ├── reputation/page.js
 │    ├── audits/page.js
 │    ├── policy/page.js
 │    └── layout.js
 │
 ├── components/
 │    ├── Sidebar.js
 │    ├── Topbar.js
 │    ├── PageHeader.js
 │    ├── MetricCard.js
 │    ├── SectionCard.js
 │    ├── SimpleTable.js
 │    ├── Badge.js
 │    └── EmptyState.js
 │
 └── lib/
      ├── api.js
      └── format.js
```

## Notes

This UI is designed to work with the UZYNTRA Rust API Firewall backend and is intended as the administrative threat control console for the platform.

## Roadmap

* confirmation modals
* richer event analytics
* charts and trend views
* advanced policy UX
* auth hardening
* SaaS-ready tenant controls


---
