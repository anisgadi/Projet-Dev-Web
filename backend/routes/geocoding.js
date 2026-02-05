const express = require("express");
const axios = require("axios");
const router = express.Router();

// @desc    Géocodage inversé (coordonnées -> adresse)
// @route   GET /api/geocoding/reverse?lat=XX&lng=XX
// @access  Public
router.get("/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude et longitude requises",
      });
    }

    // Utiliser l'API de géocodage inversé de Google Maps
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"}`,
    );

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const result = response.data.results[0];
      const addressComponents = result.address_components;

      // Extraire les composants de l'adresse
      let adresse = "";
      let ville = "";
      let codePostal = "";
      let wilaya = "";

      addressComponents.forEach((component) => {
        if (
          component.types.includes("street_number") ||
          component.types.includes("route")
        ) {
          adresse += component.long_name + " ";
        }
        if (component.types.includes("locality")) {
          ville = component.long_name;
        }
        if (component.types.includes("postal_code")) {
          codePostal = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          wilaya = component.long_name;
        }
      });

      res.status(200).json({
        success: true,
        data: {
          adresse: adresse.trim() || result.formatted_address,
          ville: ville || wilaya,
          codePostal: codePostal || "N/A",
          adresseComplete: result.formatted_address,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Adresse non trouvée",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du géocodage inversé",
    });
  }
});

module.exports = router;
