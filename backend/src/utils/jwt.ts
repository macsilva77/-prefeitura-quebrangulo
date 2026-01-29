import jwt from 'jsonwebtoken';

// Interface para o payload do token
export interface TokenPayload {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'visualizador';
}

// Gerar token JWT
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'secret_default_mudar';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn } as any);
};

// Gerar refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_default';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as any);
};

// Verificar token
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'secret_default_mudar';

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
};

// Verificar refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_default';

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Refresh token inválido ou expirado');
  }
};

// Extrair token do header Authorization
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
};
