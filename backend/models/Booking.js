const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    salle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateDebut: {
      type: Date,
      required: [true, "La date de début est requise"],
    },
    dateFin: {
      type: Date,
      required: [true, "La date de fin est requise"],
    },
    nombrePersonnes: {
      type: Number,
      required: [true, "Le nombre de personnes est requis"],
      min: 1,
    },
    prixTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    statut: {
      type: String,
      enum: ["en_attente", "confirmee", "annulee", "terminee"],
      default: "confirmee",
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Vérifier que la date de fin est après la date de début
bookingSchema.pre("save", function (next) {
  if (this.dateFin <= this.dateDebut) {
    next(new Error("La date de fin doit être après la date de début"));
  }
  next();
});

// Index pour optimiser les recherches
bookingSchema.index({ salle: 1, dateDebut: 1, dateFin: 1 });
bookingSchema.index({ client: 1, dateCreation: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
