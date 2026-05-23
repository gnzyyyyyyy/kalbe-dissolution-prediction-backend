const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "/app/shared-uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
})

// File Filter
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = [".xlsx", ".xls"];
    const allowedMimes = [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
    ]

    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext) && allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only XLSX and XLS files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    }
});

module.exports = upload;