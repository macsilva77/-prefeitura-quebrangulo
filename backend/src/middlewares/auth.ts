import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

// Estender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: 'admin' | 'user' | 'visualizador';
      };
    }
  }
}

// Middleware de autenticação
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrair token do header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Token não fornecido',
      });
      return;
    }

    // Verificar token
    const decoded = verifyToken(token);

    // Adicionar usuário ao request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token inválido ou expirado',
    });
  }
};

// Middleware de autorização por role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Não autenticado',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Permissão insuficiente',
      });
      return;
    }

    next();
  };
};

// Middleware para admin apenas
export const adminOnly = authorize('admin');

// Middleware para admin e user (não visualizador)
export const canEdit = authorize('admin', 'user');
