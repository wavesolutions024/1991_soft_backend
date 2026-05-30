import multer from "multer";
import path from "path";
import fs from "fs"


const storage = multer.diskStorage({
destination: (req,file,cb)=>{
    // const folder = "/var/www/images/1991tattoo";
    // const folder = "D:/Ketan/git/1991_soft_backend/images";
    const folder = "/Users/ketandudka/Desktop/Wave_works/1991_soft_backend/images";

    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder, {recursive:true})
    }

    cb(null,folder)
},

filename:(req,file,cb)=>{
     const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "");

    cb(null, `${name}-${Date.now()}${ext}`);
}
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});