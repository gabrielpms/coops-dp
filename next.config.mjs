const skills = ['./skills/**/*'];

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // os SKILL.md são lidos do disco em tempo de execução (status e envio das skills); a Vercel só os leva se forem incluídos aqui
  outputFileTracingIncludes: { '/admin': skills, '/admin/integracoes': skills, '/api/me/integrations/anthropic/**': skills },
};
