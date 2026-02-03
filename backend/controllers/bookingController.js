const Booking = require("../models/Booking");
const Room = require("../models/Room");

// @desc    Obtenir toutes les réservations
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("client", "nom prenom email")
      .populate("salle", "titre prix")
      .sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une réservation par ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("client", "nom prenom email telephone")
      .populate({
        path: "salle",
        populate: [
          { path: "proprietaire", select: "nom prenom email telephone" },
          {
            path: "avis",
            populate: { path: "client", select: "nom prenom" },
          },
        ],
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    // Vérifier que l'utilisateur a le droit de voir cette réservation
    if (
      booking.client._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à voir cette réservation",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer une réservation
// @route   POST /api/bookings
// @access  Private (Client)
exports.createBooking = async (req, res, next) => {
  try {
    const { salle, dateDebut, dateFin, nombrePersonnes } = req.body;

    // Vérifier que la salle existe
    const room = await Room.findById(salle);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Salle non trouvée",
      });
    }

    // Vérifier que la salle est approuvée
    if (!room.approuve || room.statut !== "approuve") {
      return res.status(400).json({
        success: false,
        message: "Cette salle n'est pas encore approuvée",
      });
    }

    // Vérifier la capacité
    if (nombrePersonnes > room.capacite) {
      return res.status(400).json({
        success: false,
        message: `La capacité maximale est de ${room.capacite} personnes`,
      });
    }

    // Vérifier les conflits de dates
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (debut >= fin) {
      return res.status(400).json({
        success: false,
        message: "La date de fin doit être après la date de début",
      });
    }

    const conflictingBookings = await Booking.find({
      salle,
      statut: { $in: ["en_attente", "confirmee"] },
      $or: [
        { dateDebut: { $lte: debut }, dateFin: { $gt: debut } },
        { dateDebut: { $lt: fin }, dateFin: { $gte: fin } },
        { dateDebut: { $gte: debut }, dateFin: { $lte: fin } },
      ],
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cette salle est déjà réservée pour cette période",
      });
    }

    // Calculer le prix total
    const diffMs = fin - debut;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7);

    let prixTotal;
    if (room.typePrix === "heure") {
      prixTotal = Math.ceil(diffHours) * room.prix;
    } else if (room.typePrix === "jour") {
      prixTotal = Math.ceil(diffDays) * room.prix;
    } else if (room.typePrix === "semaine") {
      prixTotal = Math.ceil(diffWeeks) * room.prix;
    }

    // Créer la réservation
    const booking = await Booking.create({
      salle,
      client: req.user.id,
      dateDebut,
      dateFin,
      nombrePersonnes,
      prixTotal,
      statut: "confirmee",
    });

    res.status(201).json({
      success: true,
      message: "Réservation créée avec succès",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une réservation
// @route   PUT /api/bookings/:id
// @access  Private (Admin)
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une réservation
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Réservation supprimée",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir mes réservations (client)
// @route   GET /api/bookings/my-bookings
// @access  Private (Client)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ client: req.user.id })
      .populate("salle")
      .sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les réservations d'un propriétaire
// @route   GET /api/bookings/owner-bookings
// @access  Private (Propriétaire)
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const rooms = await Room.find({ proprietaire: req.user.id });
    const roomIds = rooms.map((room) => room._id);

    const bookings = await Booking.find({ salle: { $in: roomIds } })
      .populate("client", "nom prenom email telephone")
      .populate("salle", "titre prix")
      .sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Annuler une réservation
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Client)
exports.cancelBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    // Vérifier que c'est bien le client qui a fait la réservation
    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à annuler cette réservation",
      });
    }

    // Ne peut annuler que si confirmée ou en attente
    if (booking.statut !== "confirmee" && booking.statut !== "en_attente") {
      return res.status(400).json({
        success: false,
        message: "Cette réservation ne peut pas être annulée",
      });
    }

    booking.statut = "annulee";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Réservation annulée",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
