/**
 * Backfill BetAnalytic IDs for existing users
 * Run: npx tsx scripts/backfill-betanalytic.ts
 */

import { PrismaClient } from "@prisma/client"

const API_URL = process.env.BETANALYTIC_API_URL ?? "https://api.srv1066171.hstgr.cloud"
const INTERNAL_SECRET = process.env.BETANALYTIC_INTERNAL_SECRET ?? "28b5305a85132aa07572168ebccbcfd12399c290285dc8e52d8c0394fb22767d"
const ADMIN_KEY = process.env.BETANALYTIC_ADMIN_KEY ?? "ba-admin-e08c9151eabb91a2a2e43eef9218347a"

const db = new PrismaClient()

async function lookupBetaUserByEmail(email: string): Promise<{ id: string; api_key: string } | null> {
  const res = await fetch(`${API_URL}/api/admin/users/by-email/${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${ADMIN_KEY}`,
      "X-Internal-Secret": INTERNAL_SECRET,
    },
  })
  if (!res.ok) return null
  return res.json() as Promise<{ id: string; api_key: string }>
}

async function createBetaUser(params: {
  email?: string | null
  username: string
  tier: string
}): Promise<{ id: string; api_key: string } | null> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_KEY}`,
      "X-Internal-Secret": INTERNAL_SECRET,
    },
    body: JSON.stringify({
      email: params.email ?? undefined,
      username: params.username,
      tier: params.tier,
    }),
  })

  if (res.status === 409 && params.email) {
    // Email already exists — fetch existing account
    return lookupBetaUserByEmail(params.email)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  const data = await res.json() as { success: boolean; user: { id: string; api_key: string } }
  return data.user
}

async function main() {
  const users = await db.user.findMany({
    where: { betanalyticId: null },
    select: {
      id: true,
      email: true,
      username: true,
      subscriptionTier: true,
    },
  })

  console.log(`Found ${users.length} users without betanalyticId\n`)

  let ok = 0
  let failed = 0

  for (const user of users) {
    const username = user.username ?? user.email?.split("@")[0] ?? `user-${user.id.slice(0, 8)}`
    try {
      const result = await createBetaUser({
        email: user.email,
        username,
        tier: user.subscriptionTier ?? "FREE",
      })

      if (!result) {
        console.warn(`⚠ ${username}: impossible de lier (email: ${user.email})`)
        failed++
        continue
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          betanalyticId: result.id,
          betanalyticApiKey: result.api_key,
        },
      })

      console.log(`✓ ${username} → ${result.id}`)
      ok++
    } catch (err) {
      console.error(`✗ ${username}: ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`\nDone: ${ok} synced, ${failed} failed`)
  await db.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
