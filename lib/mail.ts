// Envio de e-mail (M10). Em desenvolvimento só registra no log.
export async function sendMail(to: string, subject: string, body: string) {
  if (process.env.SMTP_URL) throw new Error('Envio SMTP ainda não implementado (M10)');
  console.log(`[mail] para=${to} assunto="${subject}"\n${body}`);
}
