import { useId } from 'react';
import { avatarSvg, type AvatarConfig } from './avatarSvg';

export * from './avatarSvg';

/** Avatar do Coops: SVG de 100×100 no traço do produto (contorno de 1,6 em tinta, formas chapadas, paleta do produto). */
export function Avatar({ size = 160, label = 'Avatar', ...p }: AvatarConfig & { size?: number; label?: string }) {
  const uid = useId();
  const n = Number(size);
  return <span style={{ display: 'inline-block', width: n, height: n, position: 'relative', lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: avatarSvg(p, n, `av${uid}`, label) }} />;
}
