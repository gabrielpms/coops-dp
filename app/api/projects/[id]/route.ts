import { db } from '@/lib/db';
import { accessibleWhere, projectInclude, serializeProject, updateProject } from '@/lib/projects';
import { projectSchema } from '@/lib/validation';
import { fail, isResponse, json, parse, requireUser } from '@/lib/api/http';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  const { id } = await params;
  const p = await db.project.findFirst({ where: { id, ...accessibleWhere(u.id) }, include: projectInclude });
  return p ? json({ project: serializeProject(p) }) : fail(404, 'Projeto não encontrado');
}

export async function PATCH(req: Request, { params }: Ctx) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  const { id } = await params;
  const p = await db.project.findFirst({ where: { id, ...accessibleWhere(u.id) } });
  if (!p) return fail(404, 'Projeto não encontrado');
  if (u.role !== 'MANAGER') return fail(403, 'Só managers editam o projeto');
  const body = await parse(req, projectSchema);
  if (isResponse(body)) return body;
  await updateProject(id, body);
  await db.draft.deleteMany({ where: { userId: u.id, scope: 'project', entityId: id } });
  const next = await db.project.findUniqueOrThrow({ where: { id }, include: projectInclude });
  return json({ project: serializeProject(next) });
}
