// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://edkihcvfbzetxomyusvy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVka2loY3ZmYnpldHhvbXl1c3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDA0MTIsImV4cCI6MjA2MTA3NjQxMn0.dcSm6rq8e9SWdWaTdSt4L04WIEff8OzYolbrQodaTNA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);