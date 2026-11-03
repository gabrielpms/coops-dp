import { ScreenLoader } from '@/components/ds/ScreenLoader';

// Mostrado pelo Next enquanto uma tela espera os dados do servidor (navegação e carga lenta).
export default function Loading() {
  return <ScreenLoader />;
}
