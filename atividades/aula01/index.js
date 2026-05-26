import { unique, groupBy, sumBy } from './arrayUtils.js';

// testando unique
console.log("--- UNIQUE ---");
console.log(unique([1, 2, 2, 3, 4, 4, 5])); 
// Retorna: [1, 2, 3, 4, 5] (Remove as duplicatas usando o objeto Set)

// testando groupBy
console.log("\n--- GROUP BY ---");
const pessoas = [
  { nome: 'Ana', cargo: 'Dev' },
  { nome: 'Bia', cargo: 'Design' },
  { nome: 'Carlos', cargo: 'Dev' }
];
console.log(groupBy(pessoas, 'cargo'));
// retorna objetos agrupados

// testando sumBy
console.log("\n--- SUM BY ---");
const carrinho = [
  { item: 'Mouse', valor: 50 },
  { item: 'Teclado', valor: 100 }
];
console.log(sumBy(carrinho, 'valor'));