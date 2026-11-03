import { NextResponse } from 'next/server';

// O acesso por link de e-mail foi substituído por e-mail + senha.
export function GET(req: Request) {
  return NextResponse.redirect(new URL('/entrar', req.url));
}
