import { destroySession } from '@/lib/session';
import { json } from '@/lib/api/http';
export async function POST() { await destroySession(); return json({ ok: true }); }
