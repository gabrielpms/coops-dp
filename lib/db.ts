import { PrismaClient } from '@prisma/client';

/** Aceita DATABASE_URL ou as variáveis que a integração Supabase/Vercel cria. */
const raw = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL;

/** No pooler do Supabase (porta 6543) o Prisma precisa de pgbouncer=true; sem isso cada função abre conexão nova e lenta. */
function tuned(u?: string) {
  if (!u) return u;
  try {
    const x = new URL(u);
    if (x.port === '6543' || x.hostname.includes('pooler.supabase.com')) {
      if (!x.searchParams.has('pgbouncer')) x.searchParams.set('pgbouncer', 'true');
      if (!x.searchParams.has('connection_limit')) x.searchParams.set('connection_limit', '1');
    }
    return x.toString();
  } catch { return u; }
}
const url = tuned(raw);

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient(url ? { datasourceUrl: url } : undefined);
if (process.env.NODE_ENV !== 'production') g.prisma = db;
