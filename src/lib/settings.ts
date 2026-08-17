import { getSql } from './db'

export async function getSetting(key: string): Promise<string | null> {
  try {
    const rows = await getSql()`SELECT value FROM settings WHERE key = ${key}`
    return rows[0]?.value ?? null
  } catch (err) {
    console.error('getSetting error:', err)
    return null
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getSql()`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `
}
