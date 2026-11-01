# AGENTS.md

## What this project is

A single-file, client-side page: `index.html` ("Nexus Financial Control"), a
Brazilian Portuguese financial dashboard. All HTML, CSS and JS live in that one
file. Transactions are kept in the browser's `localStorage` under
`nexus_financial_transactions_v1` — there is no backend, database, build step,
dependency manifest, or external service, and therefore **no secrets**.

## Running it

```sh
docker compose -f docker-compose.base44.yml up -d --build
```

One service (`web`) uses the plain `node:22-alpine` image, bind-mounts the repo
at `/app`, and runs `.base44/dev-server.mjs` on port 3000 → host port 3000.

`.base44/dev-server.mjs` is a zero-dependency static server for the sandbox: it
serves the repo root, injects a tiny SSE client into HTML responses, and reloads
the page when a file changes (it polls mtimes, so bind mounts work regardless of
inotify support). The `/__base44_reload` endpoint is that SSE channel. Because
it polls, an edit reaches the browser within about a second; it does not affect
the page's own behaviour.

## Verifying

- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` should return `200`.
- `docker compose -f docker-compose.base44.yml ps` should show `web` as `healthy`.
- In the browser: cards show `R$ 0,00`, the chart shows six months of empty bars,
  and the history table shows "Nenhum lançamento cadastrado."

## Quirks

- The delete button calls `window.confirm()`. An automated browser that does not
  answer the dialog blocks the page thread, so delete cannot be driven
  automatically — verify it by hand.
- Test data added during verification lives only in `localStorage`; clear the
  `nexus_financial_transactions_v1` key afterwards so no sample record is left.
- Dates are formatted with `pt-BR` locale and `Intl.NumberFormat` for BRL.
