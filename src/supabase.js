import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://apjqnqxkdoscfkbnszii.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwanFucXhrZG9zY2ZrYm5zemlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODM4ODgsImV4cCI6MjA2NjI1OTg4OH0.HCPwsaIxSsLEAtrEs_Pph-2QGMhQJZj0BkaAN7JDB4k'
export const supabase = createClient(supabaseUrl, supabaseKey)