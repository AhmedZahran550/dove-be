import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

/**
 * Multer configuration for schedule file uploads
 * Supports Excel (.xlsx, .xls) and CSV (.csv) files
 */
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/schedules',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `schedule-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return cb(
        new BadRequestException(
          `Unsupported file type. Allowed types: ${allowedExtensions.join(', ')}`,
        ),
        false,
      );
    }
    cb(null, true);
  },
};

/**
 * Memory storage config for when we don't need to save file to disk
 * Useful for direct processing of uploaded files
 */
export const multerMemoryConfig = {
  storage: undefined, // Uses memory storage by default
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return cb(
        new BadRequestException(
          `Unsupported file type. Allowed types: ${allowedExtensions.join(', ')}`,
        ),
        false,
      );
    }
    cb(null, true);
  },
};
