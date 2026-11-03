'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, type ComponentProps, type MouseEvent } from 'react';

/** Cortina entre páginas: anima, escurece (html.coops-leaving, 260 ms) e só então navega pelo roteador. */
export function useCoopsRouter() {
  const router = useRouter();
  const go = useCallback((href: string, opts?: { replace?: boolean; delay?: number }) => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('coops-leaving');
    window.setTimeout(() => {
      (opts?.replace ? router.replace : router.push)(href);
      window.setTimeout(() => document.documentElement.classList.remove('coops-leaving'), 400);
    }, reduce ? 0 : (opts?.delay ?? 260));
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
    window.setTimeout(() => go(String(href)), 330);
  };
  return <Link href={href} onClick={click} {...rest}>{children}</Link>;
}
