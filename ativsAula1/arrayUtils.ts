// <T> é o genérico. Significa que a função aceita um array de qualquer tipo (números, strings, etc)
export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

// T representa o objeto, K representa a chave (que deve existir dentro do objeto T)
export const groupBy = <T, K extends keyof T>(arr: T[], key: K): Record<string, T[]> => {
  return arr.reduce((acc, obj) => {
    const groupKey = String(obj[key]);
    (acc[groupKey] = acc[groupKey] || []).push(obj);
    return acc;
  }, {} as Record<string, T[]>);
};

// Pega um array de objetos T e soma a propriedade K (que deve ser número)
export const sumBy = <T, K extends keyof T>(arr: T[], key: K): number => {
  return arr.reduce((total, obj) => {
    const value = obj[key];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
};