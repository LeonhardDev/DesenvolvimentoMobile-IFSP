import type { Priority, ProjectStatus, TaskStatus } from '../types';

/**
 * Ponte entre os enums do backend (MAIÚSCULAS, sem acento) e os rótulos em português
 * exibidos na UI — e vice-versa, para os filtros/seletores. Concentrar isso aqui garante
 * que o visual continue idêntico ao dos mocks originais.
 */

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  A_FAZER: 'A fazer',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ATIVO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

/** Ordem canônica das abas de status de tarefa (igual aos mocks originais). */
export const TASK_STATUS_ORDER: TaskStatus[] = ['A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA'];

export const PRIORITY_ORDER: Priority[] = ['BAIXA', 'MEDIA', 'ALTA'];

/** Iniciais do nome para os avatares (ex.: "Ana Silva" -> "AS"). */
export function iniciais(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** "2026-06-18" -> "18 Jun". Parse manual evita deslocamento de fuso. */
export function formatarDataCurta(isoDate: string | null): string {
  if (!isoDate) return 'Sem prazo';
  const [ano, mes, dia] = isoDate.split('-').map(Number);
  if (!ano || !mes || !dia) return isoDate;
  return `${dia} ${MESES[mes - 1]}`;
}

/** "2026-06-18" -> "18 Jun 2026". */
export function formatarDataLonga(isoDate: string | null): string {
  if (!isoDate) return 'Sem prazo';
  const [ano, mes, dia] = isoDate.split('-').map(Number);
  if (!ano || !mes || !dia) return isoDate;
  return `${dia} ${MESES[mes - 1]} ${ano}`;
}

/** Instant ISO -> texto relativo em PT (ex.: "Há 2 horas"). */
export function tempoRelativo(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Agora mesmo';
  if (min < 60) return `Há ${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Há ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  const dias = Math.floor(horas / 24);
  return `Há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

/** Ícone (emoji) do feed de atividades por tipo. */
export function iconeAtividade(type: string): string {
  switch (type) {
    case 'TASK_COMPLETED':
      return '✅';
    case 'PROJECT_CREATED':
      return '📁';
    default:
      return '🔔';
  }
}
