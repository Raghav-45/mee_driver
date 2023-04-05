import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://emnsiyzfdhrwlpntoxti.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnNpeXpmZGhyd2xwbnRveHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk3NDQzMDcsImV4cCI6MTk5NTMyMDMwN30.bOLzFyg1mFwYKVnjEJdLcT3bxQRw3-cxG3fLQX-7JFs')