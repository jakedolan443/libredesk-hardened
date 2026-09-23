# Mailbox frontend

Vue 3 application in `apps/main`, with shared components in `shared-ui`.
Run these commands from `frontend`:

```sh
pnpm install
pnpm dev:main
```

The development server proxies API and WebSocket requests to the backend on port 9000.
Override these with `LD_API_TARGET`, `LD_WS_TARGET`, and `LD_DEV_PORT` as needed.

```sh
pnpm build:main  # Production assets in dist/main
pnpm test:run    # Vitest unit tests
pnpm test:e2e:ci # Cypress against a running backend on localhost:9000
```

Cypress integration tests need a disposable installation, a System login, and MailHog
for SMTP tests. The CI workflow in `.github/workflows/frontend-ci.yml` supplies these.
Set `CYPRESS_SYSTEM_PASSWORD` and `CYPRESS_MAILHOG_URL` for another test installation.

Use `pnpm exec prettier --write <paths>` to format changed source files.
