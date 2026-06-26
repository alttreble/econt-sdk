# econt-sdk

Maintains a versioned **OpenAPI specification** for the [Econt API](https://ee.econt.com/services/) and serves an interactive API reference from it.

Econt publishes a ready-made OpenAPI spec at [`ee.econt.com/services/openapi.yaml`](https://ee.econt.com/services/openapi.yaml), but it carries no version numbers and offers no changelog feed. This project snapshots that spec into a dated, version-controlled archive each time it changes — giving you a stable schema you can feed into client generators, mock servers, contract tests, and docs tooling — and publishes a browsable reference site from it.

## What it produces

| Artifact | Description |
| --- | --- |
| `openapi.yaml` | The latest Econt OpenAPI schema. |
| `versions/<YYYY-MM-DD>.yaml` | An archived schema for each day the spec changed. |
| `versions/index.json` | Manifest of all known versions, with `latest` and snapshot timestamps. |
| Scalar reference site | Interactive API docs deployed to GitHub Pages (see [`docs/index.html`](docs/index.html)). |

## How it works

The schema is keyed by the **date it changed**. [`gen/release.ts`](gen/release.ts) fetches the live
spec and, only when its bytes differ from the committed `openapi.yaml`, writes a new
`versions/<date>.yaml`, refreshes `openapi.yaml`, and upserts `versions/index.json`. Upstream bytes
are preserved verbatim (no re-serialization), so re-running against an unchanged spec produces no
diff.

## Usage

Install dependencies (requires [Bun](https://bun.sh)):

```bash
bun install
```

Fetch the live schema and snapshot it if it changed:

```bash
bun run generate
```

Snapshot from a local file instead (deterministic):

```bash
bun ./gen/release.ts --offline path/to/openapi.yaml
```

Exit non-zero when the schema changed (used by CI to trigger a PR):

```bash
bun run generate:check
```

### API reference site

Preview the Scalar reference locally:

```bash
bun run docs:preview
```

It is published to GitHub Pages on every push to `main` that changes `openapi.yaml` or the docs
shell (see [`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml)). Enable it once
under repo **Settings → Pages → Source: "GitHub Actions"**.

A weekly [`check-schema`](.github/workflows/check-schema.yml) workflow runs the same fetch and opens
a PR when Econt's spec changes, so updates land via review rather than silently.

## Project layout

```
gen/
  release.ts        # snapshots the published Econt schema into versions/
docs/index.html     # Scalar reference shell (loads openapi.yaml)
versions/           # archived per-version schemas + index.json manifest
openapi.yaml        # latest schema
```
