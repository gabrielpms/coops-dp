'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, type ComponentProps, type MouseEvent } from 'react';

/** Fica no layout raiz: tira a cortina quando a rota muda de fato, em vez de por tempo fixo (que revelava a página antiga em esperas longas). */
export function CurtainGuard() {
  const path = usePathname();
  useEffect(() => {
    const t = window.setTimeout(() => document.documentElement.classList.remove('coops-leaving'), 120);
    return () => window.clearTimeout(t);
  }, [path]);
  return null;
}

/** Cortina entre páginas: escurece (html.coops-leaving, 260 ms) enquanto a navegação já começa em paralelo, então a espera do servidor e a animação não se somam. */
export function useCoopsRouter() {
  const router = useRouter();
  const go = useCallback((href: string, opts?: { replace?: boolean }) => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('coops-leaving');
    (opts?.replace ? router.replace : router.push)(href);
    // A cortina só sai quando a nova página aparece (CurtainGuard); este tempo é só uma rede de segurança.
    window.setTimeout(() => document.documentElement.classList.remove('coops-leaving'), reduce ? 0 : 12000);
  }, [router]);
  return { go, refresh: router.refresh };
}

export function CoopsLink({ href, onClick, children, ...rest }: ComponentProps<typeof Link>) {
  const { go } = useCoopsRouter();
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.classList.add('coops-go');
    go(String(href));
  };
  return <Link href={href} onClick={click} {...rest}>{children}</Link>;
}
