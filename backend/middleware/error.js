const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur pour le développeur
  console.error(err);

  // Erreur de validation Mongoose
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = {
      message: message,
      statusCode: 400,
    };
  }

  // Erreur de duplication (clé unique)
  if (err.code === 11000) {
    const message = "Valeur dupliquée détectée";
    error = {
      message: message,
      statusCode: 400,
    };
  }

  // Erreur de cast Mongoose (ID invalide)
  if (err.name === "CastError") {
    const message = "Ressource non trouvée";
    error = {
      message: message,
      statusCode: 404,
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Erreur serveur",
  });
};

module.exports = errorHandler;
