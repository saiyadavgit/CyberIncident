export type Role = 'EMPLOYEE' | 'ANALYST' | 'ADMIN';

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  fullName: string;
  role: Role;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}