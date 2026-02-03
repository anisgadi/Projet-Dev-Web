const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialiser Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  }),
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/upload", require("./routes/upload"));

// Route de test
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API de réservation de salles - Bienvenue!",
  });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`,
  );
});

// Gestion des rejets de promesses non gérés
process.on("unhandledRejection", (err, promise) => {
  console.log(`Erreur: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
