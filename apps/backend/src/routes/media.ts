import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Asegurar que exista el directorio de uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Sube una imagen o video.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

router.post('/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      url: fileUrl,
      type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir).map(filename => {
      const stats = fs.statSync(path.join(uploadDir, filename));
      const ext = path.extname(filename).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
      
      return {
        url: `/uploads/${filename}`,
        name: filename,
        type: isVideo ? 'video' : 'image',
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    
    files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la biblioteca de medios' });
  }
});

export default router;
