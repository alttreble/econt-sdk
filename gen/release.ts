import { join } from 'path';

/**
 * Snapshots Econt's published OpenAPI schema into a version-controlled archive.
 *
 * Unlike Speedy/DPD, Econt ships a ready-made spec and has no changelog feed, so
 * there is no upstream version number to key off (`info.version` is a static
 * `1.0.0`). We therefore version by the date the schema changed:
 *
 *   - `versions/<YYYY-MM-DD>.yaml` — the archived schema for that day
 *   - `openapi.yaml`               — always the latest schema
 *   - `versions/index.json`        — manifest of all known versions
 *
 * The upstream bytes are preserved verbatim (no re-serialization) so diffs
 * reflect exactly what Econt published. Re-running against an unchanged upstream
 * produces no diff.
 *
 * Usage:
 *   bun ./gen/release.ts                 fetch the live schema and snapshot it
 *   bun ./gen/release.ts --offline FILE  snapshot from a local file (deterministic)
 *   bun ./gen/release.ts --check         exit 1 if the schema changed (CI trigger)
 */

export const ECONT_OPENAPI_URL = 'https://ee.econt.com/services/openapi.yaml';

type ManifestEntry = {
  version: string;
  file: string;
  generatedAt: string;
};

type Manifest = {
  latest: string;
  versions: ManifestEntry[];
};

export interface ReleaseOptions {
  /** Read the schema from a local file instead of fetching it (deterministic). */
  offlineFile?: string;
  /** Repository root the artifacts are written relative to. Defaults to the cwd. */
  outDir?: string;
}

export interface ReleaseResult {
  changed: boolean;
  version: string | null;
}

/** Reads a file as text, or returns null if it does not exist. */
async function readIfExists(path: string): Promise<string | null> {
  const file = Bun.file(path);
  return (await file.exists()) ? file.text() : null;
}

/**
 * Upserts a version into the manifest. Existing versions keep their original
 * `generatedAt`, so re-running for an unchanged schema produces no diff.
 */
async function updateManifest(path: string, version: string, file: string): Promise<void> {
  let manifest: Manifest = { latest: version, versions: [] };

  const existing = await readIfExists(path);
  if (existing) {
    try {
      manifest = JSON.parse(existing) as Manifest;
    } catch {
      // Corrupt/empty manifest — start fresh.
    }
  }

  if (!manifest.versions.some((v) => v.version === version)) {
    manifest.versions.push({ version, file, generatedAt: new Date().toISOString() });
  }

  // Newest first (YYYY-MM-DD sorts chronologically).
  manifest.versions.sort((a, b) => (a.version < b.version ? 1 : -1));
  manifest.latest = manifest.versions[0]?.version ?? version;

  await Bun.write(path, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Fetches/loads the schema, compares it to the committed `openapi.yaml`, and
 * writes a new version when it changed.
 */
export async function release(opts: ReleaseOptions = {}): Promise<ReleaseResult> {
  const { offlineFile, outDir = '.' } = opts;

  const yaml = offlineFile
    ? await Bun.file(offlineFile).text()
    : await fetch(ECONT_OPENAPI_URL).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch schema: HTTP ${res.status}`);
        return res.text();
      });

  const latestFile = join(outDir, 'openapi.yaml');
  const current = await readIfExists(latestFile);
  if (current === yaml) {
    return { changed: false, version: null };
  }

  const version = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const versionsDir = join(outDir, 'versions');

  await Bun.write(join(versionsDir, `${version}.yaml`), yaml);
  await Bun.write(latestFile, yaml);
  await updateManifest(join(versionsDir, 'index.json'), version, `${version}.yaml`);

  return { changed: true, version };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const offlineIdx = args.indexOf('--offline');
  const offlineFile = offlineIdx !== -1 ? args[offlineIdx + 1] : undefined;

  const { changed, version } = await release({ offlineFile });

  if (changed) {
    console.log(`Released schema version ${version} -> versions/${version}.yaml (and openapi.yaml)`);
  } else {
    console.log('Schema is up to date — no changes.');
  }

  // --check signals "needs update" to CI via a non-zero exit code.
  if (check && changed) process.exit(1);
}
