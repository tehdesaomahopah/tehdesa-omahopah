
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://daegbpegzubzmjvyprtl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZWdicGVnenViem1qdnlwcnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDUyOTcsImV4cCI6MjA1ODgyMTI5N30.NjmkrEN6L6IlgQzJz4B2FA32L1eucZzoeRHTLEyIV0Q";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
