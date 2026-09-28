import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(process.cwd(), "images");
const receiptUploadPath = path.join(process.cwd(), "images/receipts");



export const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "");

    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

export const Receiptstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(receiptUploadPath)) {
      fs.mkdirSync(receiptUploadPath, { recursive: true });
    }

    cb(null, receiptUploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "");

    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

export const receiptUpload = multer({
  storage: Receiptstorage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});



export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
