import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();

const uploadsDir = path.resolve(process.cwd(), '.data', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const ext = extMap[file.mimetype] || '.jpg';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB per image
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file harus berupa JPG, PNG, WebP, atau GIF.'));
    }
  },
});

app.use(express.json({ limit: '2mb' }));

app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '7d',
    etag: true,
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'memoria' });
});

app.post('/api/upload', (req, res) => {
  upload.array('photos', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Ukuran foto maksimal 8 MB per file.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'Gagal mengunggah foto.' });
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'Tidak ada file foto yang dipilih.' });
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);
    return res.status(201).json({ urls });
  });
});

app.delete('/api/upload/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename);
  if (!safeName || safeName.includes('..')) {
    return res.status(400).json({ error: 'Nama file tidak valid.' });
  }
  const targetPath = path.join(uploadsDir, safeName);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
  return res.json({ deleted: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MEMORIA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
