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
      validate: {
        validator: function (v) {
          return v > this.dateDebut;
        },
        message: "La date de fin doit être après la date de début",
      },
    },
    nombrePersonnes: {
      type: Number,
      required: [true, "Le nombre de personnes est requis"],
      min: [1, "Le nombre de personnes doit être au moins 1"],
    },
    prixTotal: {
      type: Number,
      required: true,
    },
    statut: {
      type: String,
      enum: ["en_attente", "confirmee", "annulee", "terminee", "refusee"],
      default: "en_attente",
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

// Vérifier les conflits de dates avant la sauvegarde
bookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const conflictingBookings = await this.constructor.find({
      salle: this.salle,
      _id: { $ne: this._id },
      statut: { $in: ["en_attente", "confirmee"] },
      $or: [
        {
          dateDebut: { $lte: this.dateDebut },
          dateFin: { $gt: this.dateDebut },
        },
        { dateDebut: { $lt: this.dateFin }, dateFin: { $gte: this.dateFin } },
        {
          dateDebut: { $gte: this.dateDebut },
          dateFin: { $lte: this.dateFin },
        },
      ],
    });

    if (conflictingBookings.length > 0) {
      throw new Error("Cette salle est déjà réservée pour cette période");
    }
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
