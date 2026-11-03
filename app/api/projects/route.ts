import { db } from '@/lib/db';
import { accessibleWhere, createProject, projectInclude, serializeProject } from '@/lib/projects';
import { projectSchema } from '@/lib/validation';
import { fail, isResponse, json, parse, requireUser } from '@/lib/api/http';
import { sendMail } from '@/lib/mail';

export async function GET() {
  const u = await requireUser();
  if (isResponse(u)) return u;
  const projects = await db.project.findMany({ where: accessibleWhere(u.id), include: projectInclude, orderBy: { createdAt: 'asc' } });
  return json({ projects: projects.map(serializeProject) });
}

export async function POST(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  if (u.role !== 'MANAGER') return fail(403, 'Só managers criam projetos');
  const body = await parse(req, projectSchema);
  if (isResponse(body)) return body;
  const id = await createProject(u.id, u.name, body);
  // O rascunho só some quando o projeto é criado (PRD 6.2).
  await db.draft.deleteMany({ where: { userId: u.id, scope: 'project', entityId: '' } });
  const project = await db.project.findUniqueOrThrow({ where: { id }, include: projectInclude });
  await Promise.all(body.invites.map((i) => sendMail(i.email, `${u.name} convidou você para a Coops`, `Você foi convidado(a) para ${body.name}. Crie sua conta com este e-mail: ${process.env.APP_URL}/cadastro`)));
  return json({ project: serializeProject(project) }, 201);
}
