// Build de produção: gera o Prisma Client, sincroniza as tabelas (só na Vercel) e compila o Next.
import { spawnSync } from 'node:child_process';

const run = (cmd, args, env = {}) => spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env }, shell: process.platform === 'win32' });

if (run('npx', ['prisma', 'generate']).status !== 0) process.exit(1);

if (process.env.VERCEL) {
  // DDL precisa de conexão direta (sem pooler). Sem --accept-data-loss: se algo for destrutivo, o push recusa.
  const direct = process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!direct) {
    console.warn('[build] Nenhuma URL de banco encontrada: pulando a criação das tabelas.');
  } else {
    const r = run('npx', ['prisma', 'db', 'push', '--skip-generate'], { DATABASE_URL: direct });
    if (r.status !== 0) console.warn('[build] prisma db push falhou: o site sobe, mas confira as tabelas no banco.');
  }
}

process.exit(run('npx', ['next', 'build']).status ?? 1);
