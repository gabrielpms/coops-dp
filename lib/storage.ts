import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

/** Armazenamento S3 compatível (Supabase Storage, Cloudflare R2, AWS S3…). Configurado só por variáveis de ambiente. */
const env = () => ({
  endpoint: process.env.S3_ENDPOINT, region: process.env.S3_REGION || 'us-east-1', bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  pathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') !== 'false',
});

export const storageConfigured = () => { const e = env(); return !!(e.bucket && e.accessKeyId && e.secretAccessKey); };

let client: S3Client | undefined;
function s3() {
  const e = env();
  if (!storageConfigured()) throw new Error('Armazenamento de arquivos não configurado (S3_*).');
  return (client ??= new S3Client({ region: e.region, endpoint: e.endpoint || undefined, forcePathStyle: e.pathStyle, credentials: { accessKeyId: e.accessKeyId!, secretAccessKey: e.secretAccessKey! } }));
}
const bucket = () => env().bucket!;

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const ALLOWED_MIME = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4', 'video/quicktime',
];

/** Nome seguro para o caminho do objeto (sem barras, espaços ou caracteres de controle). */
export const safeName = (name: string) => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.\-]+/g, '_').replace(/^\.+/, '').slice(-80) || 'arquivo';
export const objectKey = (initiativeId: string, name: string) => `initiatives/${initiativeId}/${randomUUID()}-${safeName(name)}`;

const TTL = 300;
/** URL para o navegador enviar o arquivo direto ao bucket (não passa pelo servidor). */
export const presignUpload = (key: string, mime: string) => getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: mime }), { expiresIn: TTL });
/** URL temporária de leitura; o nome original vai no download. */
export const presignDownload = (key: string, name: string) =>
  getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket(), Key: key, ResponseContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(name)}` }), { expiresIn: TTL });
export const objectSize = async (key: string) => (await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }))).ContentLength ?? 0;
export const removeObject = (key: string) => s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
