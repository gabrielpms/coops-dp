'use client';
import { createContext, useContext, type ReactNode } from 'react';

export type ProjectInfo = { id: string; name: string; mePersonId: string | null };
const Ctx = createContext<ProjectInfo | null>(null);

/** Dados do projeto atual para o cabeçalho (nome e navegação Time / Iniciativas). Fornecido pelo layout de `/p/[projectId]`. */
export const ProjectProvider = ({ value, children }: { value: ProjectInfo; children: ReactNode }) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useProject = () => useContext(Ctx);
