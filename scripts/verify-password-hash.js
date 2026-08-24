const bcrypt = require('bcryptjs')

const args = process.argv.slice(2)
const flags = new Set(args.filter((arg) => arg.startsWith('--')))
const values = args.filter((arg) => !arg.startsWith('--'))

const usage = () => {
  console.error('Usage: node scripts/verify-password-hash.js [--admin] <email> <password>')
  console.error('  --admin    check the admins table instead of users')
  process.exit(1)
}

if (values.length !== 2) usage()

const [email, password] = values
const isAdmin = flags.has('--admin')
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.')
  console.error('Set these in your terminal before running the script.')
  process.exit(1)
}

const table = isAdmin ? 'admins' : 'users'
const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?select=password_hash,email&email=eq.${encodeURIComponent(
  email
)}&limit=1`

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  Accept: 'application/json',
}

async function run() {
  try {
    console.log(`Checking ${isAdmin ? 'admins' : 'users'} table for: ${email}`)
    const res = await fetch(url, { headers })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Supabase request failed: ${res.status} ${text}`)
    }

    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('No row found for that email.')
      process.exit(1)
    }

    const row = rows[0]
    if (!row.password_hash) {
      console.log('Found row but password_hash is missing.')
      process.exit(1)
    }

    console.log('Row found:')
    console.log(`  email: ${row.email}`)
    console.log(`  password_hash length: ${String(row.password_hash).length}`)
    console.log(`  hash prefix: ${String(row.password_hash).slice(0, 20)}...`)

    const match = await bcrypt.compare(String(password), String(row.password_hash))
    console.log(`Password match: ${match}`)
    process.exit(match ? 0 : 1)
  } catch (error) {
    console.error('Error:', error.message || error)
    process.exit(1)
  }
}

run()
