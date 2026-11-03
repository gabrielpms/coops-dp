import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { currentUser, type SessionUser } from '../session';

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (status: number, message: string, extra?: object) => json({ error: message, ...extra }, status);

export async function requireUser(): Promise<SessionUser | NextResponse> {
  return (await currentUser()) ?? fail(401, 'Entre para continuar');
}
export const isResponse = (v: unknown): v is NextResponse => v instanceof NextResponse;

export async function parse<T>(req: Request, schema: { parse: (v: unknown) => T }): Promise<T | NextResponse> {
  try { return schema.parse(await req.json()); }
  catch (e) {
    if (e instanceof ZodError) return fail(400, e.issues[0]?.message ?? 'Dados inválidos', { issues: e.issues });
    return fail(400, 'Corpo inválido');
  }
}
