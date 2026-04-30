import { Router } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

const router = Router();

// Soporte Híbrido: S3 (Prod/Enterprise) vs Local (Desarrollo)
const isS3Enabled = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME;

let uploadStorage;

if (isS3Enabled) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });

  uploadStorage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME!,
    ...( { acl: 'public-read' } as any ),
    metadata: function (req: any, file: any, cb: any) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: any, file: any, cb: any) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'uploads/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
} else {
  // Fallback Local
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Sube una imagen o video.'), false);
  }
};

const upload = multer({ 
  storage: uploadStorage,
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
    
    // Determinar la URL (s3 location vs ruta local)
    const fileUrl = isS3Enabled ? (req.file as any).location : `/uploads/${req.file.filename}`;
    
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

router.get('/', async (req, res) => {
  try {
    if (isS3Enabled) {
      const s3 = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
      });
      
      const command = new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET_NAME!,
        Prefix: 'uploads/'
      });
      
      const response = await s3.send(command);
      const files = response.Contents?.map(item => {
        const ext = path.extname(item.Key || '').toLowerCase();
        const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
        return {
          url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${item.Key}`,
          name: item.Key?.replace('uploads/', ''),
          type: isVideo ? 'video' : 'image',
          size: item.Size,
          createdAt: item.LastModified
        };
      }) || [];
      
      files.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      return res.status(200).json({ success: true, files });
    } else {
      const uploadDir = path.join(__dirname, '../../uploads');
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
      return res.status(200).json({ success: true, files });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la biblioteca de medios' });
  }
});

export default router;
