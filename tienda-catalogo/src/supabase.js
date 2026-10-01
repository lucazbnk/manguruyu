import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Esto crea la conexión completa oficial, incluyendo la base de datos y el Storage para las fotos
export const supabase = createClient(supabaseUrl, supabaseAnonKey);