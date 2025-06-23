import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tatigrgwhzguqgrpqxgl.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdGlncmd3aHpndXFncnBxeGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTg3NDQsImV4cCI6MjA2NjIzNDc0NH0.GmCahNjhOM1WxNImMzPv_q83JI6pzJxwPZn2e8TpM30'

export const supabase = createClient(supabaseUrl, supabaseKey)