# Demo hosting

Verified deployment on 2026-10-06: Netlify Free plan confirmed in the authenticated account. Public demo: https://cobro-agent-rodrigo.netlify.app/ . GitHub app installation is restricted to cobro-agent. No paid upgrade was activated.

## Repository configuration

`netlify.toml` runs `node --test tests/*.test.cjs && node scripts/build-static.cjs` and publishes `dist`. The build has no third-party dependencies and copies exactly `index.html` and `cobro-engine.js`, without transforming their contents. Tests, reports and build sources are not copied into the publish directory. Generated output is ignored by Git.

The build validates its inputs before writing. It rejects symlinked assets/directories and unexpected output entries rather than deleting them or publishing them. If it stops, inspect the named entry before deciding how to handle it.

## Provider evidence

- Netlify explicitly permits commercial projects on Free: https://www.netlify.com/guides/netlify-vs-vercel/
- Current pricing describes Free with a monthly credit limit. The pricing page is authoritative for quota and pause behavior; check the actual account plan before the first deploy: https://www.netlify.com/pricing/
- File-based build command and publish-directory configuration: https://docs.netlify.com/build/configure-builds/file-based-configuration/

Production deploy `6ac50050db1a952bf7e9bd8a` was published from `e204d8d82225c4bc39b5e9a4476fa6822c26995e`. Its actual Netlify log recorded 34 passing tests and two built demo assets. The owner subsequently approved public visibility; Netlify confirmed “Your project is public” and “Anyone can visit your production site.” The deployed URL loaded the expected heading after reload. Desktop simulation checks passed; a separate anonymous-session check and mobile verification remain pending. See [deployment report](reports/2026-10-06-netlify-private-deployment.md).

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

Complete mobile and separate anonymous-session checks on the published demo. Enable lead capture only after its end-to-end storage check. Vercel Hobby remains excluded for this commercial project.
