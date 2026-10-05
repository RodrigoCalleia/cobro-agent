# Demo hosting preparation

Verified on 2026-10-05. Provider choice for the initial commercial demo: Netlify Free, subject to authenticated account access and confirmation of the account's actual plan.

## Repository configuration

`netlify.toml` runs `node --test tests/*.test.cjs && node scripts/build-static.cjs` and publishes `dist`. The build has no third-party dependencies and copies exactly `index.html` and `cobro-engine.js`, without transforming their contents. Tests, reports and build sources are not copied into the publish directory. Generated output is ignored by Git.

The build validates its inputs before writing. It rejects symlinked assets/directories and unexpected output entries rather than deleting them or publishing them. If it stops, inspect the named entry before deciding how to handle it.

## Provider evidence

- Netlify explicitly permits commercial projects on Free: https://www.netlify.com/guides/netlify-vs-vercel/
- Current pricing describes Free with a monthly credit limit. The pricing page is authoritative for quota and pause behavior; check the actual account plan before the first deploy: https://www.netlify.com/pricing/
- File-based build command and publish-directory configuration: https://docs.netlify.com/build/configure-builds/file-based-configuration/

No account was created or connected and no deployment occurred. Plugin discovery for Netlify/Cloudflare returned no available integration in this session. A public demo URL cannot be reported until a real deploy is observed.

## Future pilot-interest capture

Netlify Forms is a candidate for leads. Current credit-based plans describe Forms as free and unlimited; legacy plans have different billing. Check the actual plan rather than applying an old submission allowance.

Activation requires authenticated access, form detection enabled and deployed HTML that Netlify recognizes. No lead form or success message is added by this change. Before enabling one, define its contact purpose, privacy information, access and retention.

The acceptance check is a real test POST followed by the matching stored record in Forms/API (including spam review when applicable). A local page, redirect, resolved fetch or HTTP 2xx alone does not prove persistence. Do not count a lead or show a saved-success claim without verified storage.

Forms is for pilot-interest capture; it is not the company's invoice database or authentication system.

Sources:
- https://docs.netlify.com/manage/forms/usage-and-billing/ (updated 2026-09-16)
- https://docs.netlify.com/manage/forms/setup/
- https://docs.netlify.com/manage/forms/submissions/

## Next coordinator action

Review/integrate this configuration, then use authorized hosting access when available. After an actual deployment, verify the browser flow on mobile and desktop against that deployed version. Enable lead capture only after its end-to-end storage check. Vercel Hobby remains excluded for this commercial project.
