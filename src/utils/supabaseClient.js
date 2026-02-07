import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Anon Key dari Dashboard Supabase -> Project Settings -> API
const supabaseUrl = 'https://ynkogwxalrudvwmjkhxv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlua29nd3hhbHJ1ZHZ3bWpraHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzk0ODAsImV4cCI6MjA4NTk1NTQ4MH0.IUWizFp9IbxDCPlAmOk2ixWQ4Zzk9LAjeYtvJn6Pccw' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)