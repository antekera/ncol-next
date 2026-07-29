import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL!
  },
  // Supabase's database has several other schemas (auth, storage,
  // realtime, extensions, vault...) with CHECK constraints drizzle-kit's
  // introspection can choke on. We only own tables in "public", so limit
  // it to that — auth.users is still referenceable via FK without needing
  // to introspect it.
  schemaFilter: ['public'],
  // "public" is also shared with ncol-legales (profiles, notices) and
  // whatever Supabase/PostGIS puts there (e.g. spatial_ref_sys, whose
  // CHECK constraint is what actually crashes introspection). We only
  // own — and should only ever touch — this one table.
  tablesFilter: ['ncol_tag_subscriptions']
})
