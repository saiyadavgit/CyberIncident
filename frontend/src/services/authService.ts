import { api } from '../utils/api';
import { decodeJwt } from '../utils/jwt';
import { isObj, normalizeAuthUser, normalizeRole, pickStr, unwrapObject } from '../utils/normalize';
import type { AuthResult, LoginInput, RegisterInput } from '../types/auth';

function toAuthResult(data: unknown): AuthResult | null {
  const o = unwrapObject(data);
  const token = pickStr(o, 'token', 'accessToken', 'jwt', 'access_token');
  if (!token) return null;
  const userRaw = isObj(o.user) ? o.user : o;
  const user = normalizeAuthUser(userRaw);
  const claims = decodeJwt(token);
  if (claims) {
    const hasRole = ['role', 'roles', 'authorities'].some((k) => userRaw[k] !== undefined);
    if (!hasRole) user.role = normalizeRole(claims.role ?? claims.roles ?? claims.authorities);
    if (user.username === 'user' && typeof claims.sub === 'string') user.username = claims.sub;
    if (!user.id && typeof claims.userId === 'number') user.id = claims.userId;
  }
  return { token, user };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const identifier = input.identifier.trim();
  const { data } = await api.post('/api/auth/login', {
    email: identifier,
    password: input.password
  });
  const result = toAuthResult(data);
  if (!result) throw new Error('Unexpected response from the authentication service.');
  return result;
}

export async function register(input: RegisterInput): Promise<AuthResult | null> {
  const { data } = await api.post('/api/auth/register', {
    name: input.fullName,
    email: input.email,
    password: input.password
  });

  return toAuthResult(data);
}