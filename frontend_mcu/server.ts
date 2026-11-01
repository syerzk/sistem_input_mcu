import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Endpoint cek status server frontend
  app.get('/api/db/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      databaseType: 'PostgreSQL (via Backend Go)',
      connected: true,
      message: 'Frontend server berjalan normal. Database dikelola oleh backend Go (Port 8080).'
    });
  });

  // Mount Vite development middlewares untuk menjalankan tampilan web
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MCU Frontend Server] Berjalan pada port ${PORT} (http://localhost:${PORT})`);
  });
}

startServer().catch((err) => {
  console.error('[MCU Server Error]:', err);
});