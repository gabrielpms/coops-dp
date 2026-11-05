import { z } from 'zod';
import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { agentReply } from '@/lib/agentStub';

type Ctx = { params: Promise<{ id: string; doubtId: string }> };
const schema = z.object({ text: z.string().trim().min(1, 'Escreva sua resposta.').max(2000) });

/** A pessoa explica; o agente responde na hora (resposta fixa) e a dúvida volta a ficar aberta até a confirmação. */
export async function POST(req: Request, { params }: Ctx) {
  const { id, doubtId } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, schema);
  if (isResponse(body)) return body;
  const doubt = await db.agentDoubt.findFirst({ where: { id: doubtId, initiativeId: id } });
  if (!doubt) return fail(404, 'Dúvida não encontrada');
  const reply = agentReply(body.text);
  await db.$transaction([
    db.agentMessage.create({ data: { doubtId, role: 'USER', text: body.text } }),
    db.agentMessage.create({ data: { doubtId, role: 'AGENT', text: reply, createdAt: new Date(Date.now() + 1) } }),
    db.agentDoubt.update({ where: { id: doubtId }, data: { resolved: false, summary: null } }),
    db.initiative.update({ where: { id }, data: { tableOpenedAt: null } }),
  ]);
  return json({ reply });
}
