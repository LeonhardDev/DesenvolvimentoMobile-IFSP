/**
 * Endereço base da API do backend.
 *
 * Em dispositivo físico (Expo Go), `localhost` aponta para o próprio celular — por isso
 * a URL precisa ser o IP da máquina que roda o backend (celular e PC na mesma rede Wi-Fi).
 * Defina antes de iniciar o Expo, ex.:
 *   EXPO_PUBLIC_API_URL=http://192.168.0.10:8080 npx expo start
 *
 * Variáveis com o prefixo EXPO_PUBLIC_ são embutidas no bundle pelo Expo (SDK 57).
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
