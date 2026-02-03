const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Non autorisé - Token manquant",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (!req.user.actif) {
      return res.status(401).json({
        success: false,
        message: "Votre compte a été banni",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Non autorisé - Token invalide",
    });
  }
};

// Autoriser selon les rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`,
      });
    }
    next();
  };
};
