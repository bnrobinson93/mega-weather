#!/usr/bin/env node
// Generates THIRD_PARTY_LICENSES.md from `pnpm licenses list --json` stdin.

import { writeFileSync } from 'node:fs'

const chunks = []
process.stdin.on('data', (d) => chunks.push(d))
process.stdin.on('end', () => {
  const data = JSON.parse(chunks.join(''))

  const lines = [
    '# Third-Party Licenses',
    '',
    'This project uses the following open-source packages.',
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
  ]

  const sorted = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))

  for (const [license, packages] of sorted) {
    lines.push(`## ${license}`)
    lines.push('')
    for (const pkg of packages.sort((a, b) => a.name.localeCompare(b.name))) {
      const ver = pkg.versions?.[0] ?? ''
      const url = pkg.repository ?? pkg.homepage ?? ''
      lines.push(
        `- **${pkg.name}**${ver ? ` (${ver})` : ''}${url ? ` — ${url}` : ''}`,
      )
    }
    lines.push('')
  }

  // MPL-2.0 notice required by license
  lines.push('## Notices')
  lines.push('')
  lines.push(
    '**lightningcss** is licensed under MPL-2.0. Source code is available at ' +
      'https://github.com/parcel-bundler/lightningcss. This project uses lightningcss ' +
      'as an unmodified dependency; no modifications have been made to its source.',
  )
  lines.push('')
  lines.push(
    '**caniuse-lite** is licensed under CC-BY-4.0. Data © Alexis Deveria. ' +
      'Used at build time only.',
  )
  lines.push('')

  const out = lines.join('\n')
  writeFileSync('THIRD_PARTY_LICENSES.md', out)
  console.log('✓ THIRD_PARTY_LICENSES.md written')
})
