// Generates public/screenshots/desktop.png (wide) and mobile.png (narrow)
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const font = 'font-family="sans-serif"'

// --- shared data ---
const hourly = [
  ['Now', '72°'],
  ['2pm', '74°'],
  ['3pm', '75°'],
  ['4pm', '73°'],
  ['5pm', '70°'],
  ['6pm', '67°'],
  ['7pm', '64°'],
]
const daily = [
  ['Today', '75°', '58°', 'Partly Cloudy'],
  ['Tue', '79°', '62°', 'Sunny'],
  ['Wed', '68°', '54°', 'Scattered Showers'],
  ['Thu', '63°', '50°', 'Cloudy'],
  ['Fri', '71°', '55°', 'Mostly Sunny'],
  ['Sat', '77°', '60°', 'Sunny'],
  ['Sun', '80°', '63°', 'Clear'],
]

// --- desktop (1280x800) ---
function buildDesktop() {
  const W = 1280
  const H = 800
  const CX = (W - 448) / 2

  const hourlyCell = (i, label, temp) => {
    const x = CX + i * 66
    const y = 348
    return `
      <rect x="${x}" y="${y}" width="58" height="90" rx="16" fill="#1e293b"/>
      <text x="${x + 29}" y="${y + 22}" ${font} font-size="11" fill="#64748b" text-anchor="middle">${label}</text>
      <circle cx="${x + 29}" cy="${y + 48}" r="10" fill="#fbbf24"/>
      <text x="${x + 29}" y="${y + 72}" ${font} font-size="13" font-weight="600" fill="#f1f5f9" text-anchor="middle">${temp}</text>`
  }

  const dailyRow = (i, day, hi, lo, cond) => {
    const y = 480 + i * 42
    return `
      <rect x="${CX}" y="${y}" width="448" height="36" rx="10" fill="#1e293b"/>
      <text x="${CX + 16}" y="${y + 23}" ${font} font-size="13" fill="#cbd5e1" font-weight="500">${day}</text>
      <text x="${CX + 90}" y="${y + 23}" ${font} font-size="12" fill="#64748b">${cond}</text>
      <text x="${CX + 390}" y="${y + 23}" ${font} font-size="13" font-weight="600" fill="#f1f5f9" text-anchor="end">${hi}</text>
      <text x="${CX + 432}" y="${y + 23}" ${font} font-size="13" fill="#475569" text-anchor="end">${lo}</text>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0f172a"/>
  <text x="${W / 2}" y="52" ${font} font-size="18" font-weight="600" fill="#e2e8f0" text-anchor="middle">Mega Weather</text>
  <rect x="${CX}" y="68" width="448" height="164" rx="20" fill="#1e293b"/>
  <text x="${CX + 20}" y="96" ${font} font-size="13" fill="#94a3b8">Austin, TX, United States</text>
  <text x="${CX + 20}" y="168" ${font} font-size="80" font-weight="700" fill="#f1f5f9">72°</text>
  <text x="${CX + 140}" y="128" ${font} font-size="14" fill="#94a3b8">Partly Cloudy</text>
  <text x="${CX + 140}" y="152" ${font} font-size="13" fill="#64748b">Feels like 70°</text>
  <text x="${CX + 140}" y="174" ${font} font-size="13" fill="#64748b">Humidity 55%  Wind 8 mph SW</text>
  <text x="${CX + 20}" y="216" ${font} font-size="13" fill="#64748b">Precip: 0.00 in</text>
  <rect x="${CX}" y="248" width="448" height="34" rx="10" fill="#1e293b"/>
  <text x="${CX + 16}" y="270" ${font} font-size="12" fill="#64748b">Optimal model:</text>
  <text x="${CX + 116}" y="270" ${font} font-size="12" font-weight="600" fill="#94a3b8">NOAA HRRR + GFS</text>
  <text x="${CX + 264}" y="270" ${font} font-size="11" fill="#475569">National Weather Service</text>
  <text x="${CX}" y="336" ${font} font-size="10" font-weight="600" fill="#475569" letter-spacing="1">NEXT 24 HOURS</text>
  ${hourly.map((h, i) => hourlyCell(i, h[0], h[1])).join('')}
  <text x="${CX}" y="470" ${font} font-size="10" font-weight="600" fill="#475569" letter-spacing="1">7-DAY FORECAST</text>
  ${daily.map((d, i) => dailyRow(i, d[0], d[1], d[2], d[3])).join('')}
  <text x="${W / 2}" y="${H - 20}" ${font} font-size="11" fill="#334155" text-anchor="middle">Weather data by Open-Meteo under CC BY 4.0</text>
</svg>`
}

// --- mobile (390x844) ---
function buildMobile() {
  const W = 390
  const H = 844
  const PAD = 16

  const hourlyCell = (i, label, temp) => {
    const x = PAD + i * 60
    const y = 470
    return `
      <rect x="${x}" y="${y}" width="52" height="82" rx="14" fill="#1e293b"/>
      <text x="${x + 26}" y="${y + 20}" ${font} font-size="10" fill="#64748b" text-anchor="middle">${label}</text>
      <circle cx="${x + 26}" cy="${y + 42}" r="9" fill="#fbbf24"/>
      <text x="${x + 26}" y="${y + 65}" ${font} font-size="12" font-weight="600" fill="#f1f5f9" text-anchor="middle">${temp}</text>`
  }

  const dailyRow = (i, day, hi, lo, cond) => {
    const y = 580 + i * 36
    return `
      <rect x="${PAD}" y="${y}" width="${W - PAD * 2}" height="30" rx="8" fill="#1e293b"/>
      <text x="${PAD + 12}" y="${y + 20}" ${font} font-size="12" fill="#cbd5e1" font-weight="500">${day}</text>
      <text x="${PAD + 70}" y="${y + 20}" ${font} font-size="11" fill="#64748b">${cond}</text>
      <text x="${W - PAD - 42}" y="${y + 20}" ${font} font-size="12" font-weight="600" fill="#f1f5f9" text-anchor="end">${hi}</text>
      <text x="${W - PAD - 4}" y="${y + 20}" ${font} font-size="12" fill="#475569" text-anchor="end">${lo}</text>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0f172a"/>
  <!-- header -->
  <text x="${W / 2}" y="48" ${font} font-size="16" font-weight="600" fill="#e2e8f0" text-anchor="middle">Mega Weather</text>
  <!-- location -->
  <text x="${W / 2}" y="96" ${font} font-size="11" fill="#64748b" text-anchor="middle">AUSTIN, TX, UNITED STATES</text>
  <!-- big weather icon (sun) -->
  <circle cx="${W / 2}" cy="198" r="52" fill="#fbbf24"/>
  <line x1="${W / 2}" y1="130" x2="${W / 2}" y2="118" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="${W / 2}" y1="266" x2="${W / 2}" y2="278" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="${W / 2 - 68}" y1="198" x2="${W / 2 - 80}" y2="198" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="${W / 2 + 68}" y1="198" x2="${W / 2 + 80}" y2="198" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="${W / 2 - 48}" y1="150" x2="${W / 2 - 56}" y2="142" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="${W / 2 + 48}" y1="150" x2="${W / 2 + 56}" y2="142" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="${W / 2 - 48}" y1="246" x2="${W / 2 - 56}" y2="254" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="${W / 2 + 48}" y1="246" x2="${W / 2 + 56}" y2="254" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <!-- temperature -->
  <text x="${W / 2}" y="330" ${font} font-size="72" font-weight="700" fill="#f1f5f9" text-anchor="middle">72°</text>
  <!-- condition -->
  <text x="${W / 2}" y="362" ${font} font-size="16" fill="#94a3b8" text-anchor="middle">Partly Cloudy</text>
  <text x="${W / 2}" y="386" ${font} font-size="13" fill="#64748b" text-anchor="middle">Feels like 70°</text>
  <!-- wind / humidity -->
  <text x="${W / 2 - 60}" y="420" ${font} font-size="13" fill="#64748b" text-anchor="middle">55% humidity</text>
  <text x="${W / 2 + 60}" y="420" ${font} font-size="13" fill="#64748b" text-anchor="middle">8 mph SW</text>
  <!-- model badge -->
  <rect x="${PAD}" y="432" width="${W - PAD * 2}" height="28" rx="8" fill="#1e293b"/>
  <text x="${W / 2}" y="450" ${font} font-size="11" fill="#94a3b8" font-weight="600" text-anchor="middle">NOAA HRRR + GFS — National Weather Service</text>
  <!-- hourly label -->
  <text x="${PAD}" y="462" ${font} font-size="9" font-weight="600" fill="#475569" letter-spacing="1">NEXT 24 HOURS</text>
  ${hourly.map((h, i) => hourlyCell(i, h[0], h[1])).join('')}
  <!-- 7-day label -->
  <text x="${PAD}" y="572" ${font} font-size="9" font-weight="600" fill="#475569" letter-spacing="1">7-DAY FORECAST</text>
  ${daily.map((d, i) => dailyRow(i, d[0], d[1], d[2], d[3])).join('')}
  <text x="${W / 2}" y="${H - 16}" ${font} font-size="10" fill="#334155" text-anchor="middle">Weather data by Open-Meteo — CC BY 4.0</text>
</svg>`
}

mkdirSync('public/screenshots', { recursive: true })

const desktop = buildDesktop()
writeFileSync('public/screenshots/desktop.svg', desktop)
execSync(
  'rsvg-convert -w 1280 -h 800 public/screenshots/desktop.svg -o public/screenshots/desktop.png',
)
console.log('Generated public/screenshots/desktop.png')

const mobile = buildMobile()
writeFileSync('public/screenshots/mobile.svg', mobile)
execSync(
  'rsvg-convert -w 390 -h 844 public/screenshots/mobile.svg -o public/screenshots/mobile.png',
)
console.log('Generated public/screenshots/mobile.png')
