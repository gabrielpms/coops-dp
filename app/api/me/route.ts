import { db } from '@/lib/db';
import { z } from 'zod';
import { avatarSchema } from '@/lib/validation';
import { isResponse, json, parse, requireUser } from '@/lib/api/http';

export async function GET() {
  const u = await requireUser();
  if (isResponse(u)) return u;
  return json({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, avatar: u.avatar, onboardingStep: u.onboardingStep });
}

const patch = z.object({ name: z.string().trim().min(1).max(120).optional(), phone: z.string().trim().max(40).optional(), avatar: avatarSchema.optional() });
export async function PATCH(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  const body = await parse(req, patch);
  if (isResponse(body)) return body;
  const next = await db.user.update({ where: { id: u.id }, data: body });
  return json({ id: next.id, name: next.name, avatar: next.avatar });
}
