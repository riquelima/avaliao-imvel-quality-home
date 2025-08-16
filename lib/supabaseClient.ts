import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// O cliente Supabase é inicializado usando as variáveis do arquivo de configuração.
// Esta abordagem centraliza a configuração e torna a aplicação mais fácil de gerenciar.
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
