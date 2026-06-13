#!/usr/bin/env node
/**
 * License compliance checker.
 * Reads `pnpm licenses list --json` output from stdin and exits non-zero
 * if any dependency uses a license not in the allowlist.
 *
 * MPL-2.0 and CC-BY-4.0 are explicitly allowed with notices:
 *   - lightningcss (MPL-2.0): used unmodified as a Tailwind CSS dep
 *   - caniuse-lite (CC-BY-4.0): build-time data only, attribution in THIRD_PARTY_LICENSES.md
 */

const ALLOWED = new Set([
  'MIT',
  'MIT-0',
  'MIT OR Apache-2.0',
  '(MIT OR CC0-1.0)',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'BlueOak-1.0.0',
  '0BSD',
  'CC0-1.0',
  'CC-BY-4.0', // caniuse-lite — build-time data, attribution in THIRD_PARTY_LICENSES.md
  'MPL-2.0', // lightningcss — used unmodified, copyleft does not propagate
])

const chunks = []
process.stdin.on('data', (d) => chunks.push(d))
process.stdin.on('end', () => {
  const data = JSON.parse(chunks.join(''))
  const violations = []

  for (const [license, packages] of Object.entries(data)) {
    if (!ALLOWED.has(license)) {
      for (const pkg of packages) {
        violations.push({
          name: pkg.name,
          version: pkg.versions?.[0] ?? '?',
          license,
        })
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n❌ License compliance violations:\n')
    for (const v of violations) {
      console.error(`  ${v.name}@${v.version}  →  ${v.license}`)
    }
    console.error(
      '\nAdd the license to ALLOWED in scripts/check-licenses.mjs with justification.',
    )
    process.exit(1)
  }

  const total = Object.values(data).reduce((sum, pkgs) => sum + pkgs.length, 0)
  console.log(`✓ ${total} packages checked — all licenses compliant`)
})
