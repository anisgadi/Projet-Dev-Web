const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email invalide",
      ],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["client", "proprietaire", "admin"],
      default: "client",
    },
    telephone: {
      type: String,
      trim: true,
    },
    adresse: {
      type: String,
      trim: true,
    },
    actif: {
      type: Boolean,
      default: true,
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

// Hasher le mot de passe avant la sauvegarde
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
