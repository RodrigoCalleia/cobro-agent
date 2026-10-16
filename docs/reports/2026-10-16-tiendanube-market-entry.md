# Tiendanube/Nuvemshop market-entry research — 2026-10-16

## Result

Evaluated whether Rondacobro can become a Tiendanube/Nuvemshop app and whether the product can expand beyond Argentina without rebuilding its core. The answer is yes, but the first release should be a private backend/Admin integration, not a public payment or storefront app.

## Recommended product boundary

1. OAuth installation from Tiendanube.
2. Read the minimum order data needed to identify follow-up candidates.
3. Classify candidates with deterministic rules and AI-assisted explanations.
4. Let the merchant review and explicitly approve any follow-up.
5. Record the action and outcome in an audit trail.
6. Keep email or WhatsApp delivery behind a separate consented integration.

The initial app should avoid payment processing, customer writes and storefront/checkout scripts. Tiendanube requires scopes to be strictly necessary, and apps using only API/Admin flows do not require NubeSDK; storefront or checkout script injection does. See the official [homologation requirements](https://tiendanube.dev/apps/publish/homologation/requirements) and [publication guidelines](https://tiendanube.dev/es-AR/apps/publish/guidelines).

## Why Tiendanube first

The platform exposes products, orders, customers, payments, shipments and webhooks through its REST API, with OAuth 2.0 authentication. It also provides a partner program, demo stores and an App Store publication path. Sources: [developer overview](https://tiendanube.dev/overview), [Socios Tecnológicos](https://www.tiendanube.com/socios/tecnologicos), [partner program help](https://ayuda.tiendanube.com/socios-tecnologicos/en-que-consiste-el-programa-de-socios-tecnologicos).

## Expansion order

- Argentina: controlled technical pilot.
- Brazil: Nuvemshop branding, Portuguese and local compliance.
- Chile, Colombia and Mexico: regional Spanish rollout.
- Shopify and WooCommerce: global connectors after the first integration proves value.
- Mercado Libre and VTEX: later, as channel-specific connectors.

The architecture should use a connector boundary so order events, merchant authorization, audit records and follow-up policies are not hard-coded to one platform.

## Homologation and monetization gates

Before public submission, Rondacobro needs real OAuth/backend installation, a demo store, a privacy policy for the app, support/contact path, sequence diagram, demo video and a complete testable flow. Tiendanube documentation says incomplete apps can be removed from the review queue. Billing should be evaluated only after a working private pilot; the initial offer must not claim revenue.

## Independent audit

The independent review approved the strategy with no critical blocker. It identified these concrete blockers:

- no production OAuth or installation backend;
- no app-specific privacy policy;
- no Partner Portal/developer account and demo store;
- no complete post-install support/contact path;
- external email/WhatsApp consent and delivery still undefined.

## Accounting and decision

- Spend: **USD 0**
- Revenue: **USD 0**
- Verified leads/customers: **0**
- No accounts, subscriptions, public listing or customer outreach were activated.

Next decision: implement and test the smallest private integration contract, then validate it with 1–3 controlled stores before pursuing public homologation.
