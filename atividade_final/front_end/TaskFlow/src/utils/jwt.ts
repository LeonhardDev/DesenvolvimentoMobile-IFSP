import type { Role } from '../types';

/**
 * Decodifica o payload de um JWT para ler o claim `role` (o backend não expõe a role
 * em nenhum DTO, só dentro do token). Implementa a decodificação base64url em JS puro
 * para não depender de `atob`, cuja disponibilidade varia entre engines do React Native.
 */

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of base64) {
    if (char === '=') break;
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  // Reinterpreta os bytes como UTF-8 (nomes/roles são ASCII aqui, mas mantém correção).
  try {
    return decodeURIComponent(
      output
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
  } catch {
    return output;
  }
}

export function roleFromToken(token: string): Role {
  try {
    const payload = token.split('.')[1];
    const claims = JSON.parse(base64UrlDecode(payload)) as { role?: string };
    return claims.role === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch {
    return 'USER';
  }
}

/** Rótulo em português da role, exibido no perfil. */
export function roleLabel(role: Role): string {
  return role === 'ADMIN' ? 'Administrador' : 'Usuário';
}
