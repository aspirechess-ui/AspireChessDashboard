import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if provided (recommended approach)
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else {
  // Fallback to individual environment variables for backward compatibility
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

class UploadService {
  constructor() {
    this.uploadProvider = process.env.UPLOAD_PROVIDER || "local"; // 'local' or 'cloudinary'
    this.localUploadPath = process.env.LOCAL_UPLOAD_PATH || "uploads";
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default
  }

  // Configure multer based on upload provider
  getMulterConfig() {
    if (this.uploadProvider === "cloudinary") {
      // For Cloudinary, store files in memory temporarily
      return multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: this.maxFileSize,
        },
        fileFilter: this.fileFilter,
      });
    } else {
      // For local storage
      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(this.localUploadPath, "profiles");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            `profile-${req.user._id}-${uniqueSuffix}${path.extname(
              file.originalname
            )}`
          );
        },
      });

      return multer({
        storage: storage,
        limits: {
          fileSize: this.maxFileSize,
        },
        fileFilter: this.fileFilter,
      });
    }
  }

  // File filter for image validation
  fileFilter = (req, file, cb) => {
    console.log("File filter check:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;

    const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
    const extensionValid = allowedExtensions.test(file.originalname);

    console.log("Validation results:", {
      mimetypeValid,
      extensionValid,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
    });

    if (mimetypeValid && extensionValid) {
      return cb(null, true);
    } else {
      const error = new Error(
        "Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed"
      );
      console.log("File filter rejected:", error.message);
      cb(error);
    }
  };

  // Process and optimize image
  async processImage(buffer, options = {}) {
    const {
      width = 400,
      height = 400,
      quality = 80,
      format = "jpeg",
    } = options;

    try {
      const processedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: "cover",
          position: "center",
        })
        .toFormat(format, { quality })
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  // Upload to Cloudinary
  async uploadToCloudinary(buffer, options = {}) {
    const {
      folder = "chess-academy/profiles",
      userId,
      transformation = {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto:good",
        format: "auto",
      },
    } = options;

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: `profile-${userId}-${Date.now()}`,
            transformation,
            overwrite: true,
            invalidate: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(buffer);
      });

      return {
        url: result.secure_url,
        path: result.public_id, // Store public_id in path field for Cloudinary
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // Upload to local storage
  async uploadToLocal(file, userId) {
    try {
      // Process the image if it's from memory storage
      let processedBuffer;
      if (file.buffer) {
        processedBuffer = await this.processImage(file.buffer);
      }

      const uploadDir = path.join(this.localUploadPath, "profiles");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `profile-${userId}-${uniqueSuffix}.jpeg`;
      const filepath = path.join(uploadDir, filename);

      if (processedBuffer) {
        // Write processed buffer to file
        fs.writeFileSync(filepath, processedBuffer);
      } else if (file.path) {
        // File already saved by multer, process it
        processedBuffer = await this.processImage(fs.readFileSync(file.path));
        fs.writeFileSync(filepath, processedBuffer);

        // Remove original file if different
        if (file.path !== filepath) {
          fs.unlinkSync(file.path);
        }
      }

      const relativePath = path.relative(process.cwd(), filepath);
      const url = `${
        process.env.BACKEND_URL || "http://localhost:5000"
      }/${relativePath.replace(/\\/g, "/")}`;

      return {
        url,
        path: filepath,
      };
    } catch (error) {
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }

  // Main upload method
  async uploadProfileImage(file, userId) {
    try {
      console.log(`Upload provider: ${this.uploadProvider}`);
      console.log("File details:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      });

      if (this.uploadProvider === "cloudinary") {
        const buffer = file.buffer || fs.readFileSync(file.path);
        return await this.uploadToCloudinary(buffer, { userId });
      } else {
        return await this.uploadToLocal(file, userId);
      }
    } catch (error) {
      console.error("Upload service error:", error);
      throw error;
    }
  }

  // Delete image
  async deleteProfileImage(imagePath) {
    try {
      if (this.uploadProvider === "cloudinary") {
        // For Cloudinary, imagePath contains the public_id
        if (imagePath) {
          await cloudinary.uploader.destroy(imagePath);
        }
      } else {
        // For local storage, imagePath contains the file path
        if (imagePath && fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      // Don't throw error for deletion failures
    }
  }

  // Get upload provider info
  getProviderInfo() {
    return {
      provider: this.uploadProvider,
      maxFileSize: this.maxFileSize,
      supportedFormats: ["jpeg", "jpg", "png", "gif", "webp"],
    };
  }
}

export default new UploadService();
