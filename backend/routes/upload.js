const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const { protect } = require("../middleware/auth");

// @desc    Upload d'images vers Cloudinary
// @route   POST /api/upload
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier uploadé",
      });
    }

    const images = [];
    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images autorisées",
      });
    }

    for (const file of files) {
      // Vérifier le type de fichier
      if (!file.mimetype.startsWith("image")) {
        return res.status(400).json({
          success: false,
          message: "Veuillez uploader seulement des images",
        });
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Taille maximale: 5MB par image",
        });
      }

      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "room-booking",
        width: 1200,
        crop: "limit",
        quality: "auto:good",
      });

      images.push(result.secure_url);
    }

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload des images",
    });
  }
});

module.exports = router;
