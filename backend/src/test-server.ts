import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (_req, res) => {
  res.json({ message: 'Teste OK' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

console.log('Script executado');
