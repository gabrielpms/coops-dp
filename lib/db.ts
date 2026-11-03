import { PrismaClient } from '@prisma/client';

/** Aceita DATABASE_URL ou as variáveis que a integração Supabase/Vercel cria. */
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL;

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient(url ? { datasourceUrl: url } : undefined);
if (process.env.NODE_ENV !== 'production') g.prisma = db;
