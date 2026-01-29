import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import routes from './routes';

// Carregar variáveis de ambiente
dotenv.config();

// Criar aplicação Express
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================

// Segurança
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api', limiter);

// ==================== ROTAS ====================

// Rota de health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor rodando com sucesso',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'API Prefeitura de Quebrangulo',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// ==================== ROTAS DA API ====================
app.use('/api', routes);

// ==================== TRATAMENTO DE ERROS ====================

// Rota não encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Error handler global
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Erro:', err);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== INICIALIZAÇÃO ====================

// Iniciar servidor
const startServer = async () => {
  try {
    // Tentar conectar ao banco de dados (não bloqueia se falhar)
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   SERVIDOR INICIADO COM SUCESSO! 🚀   ║
╠════════════════════════════════════════╣
║  Porta: ${PORT.toString().padEnd(30)}║
║  Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(25)}║
║  URL: http://localhost:${PORT.toString().padEnd(18)}║
╚════════════════════════════════════════╝
      `);
      console.log(`✅ Servidor escutando na porta ${PORT}`);
    });

    server.on('error', (error: any) => {
      console.error('❌ Erro no servidor:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Erro crítico ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  });
}

export default app;
