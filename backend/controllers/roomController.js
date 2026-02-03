const Room = require("../models/Room");
const Booking = require("../models/Booking");

// @desc    Obtenir toutes les salles
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    let query = {};

    // Filtrer selon le rôle
    if (!req.user) {
      // Visiteur : seulement salles approuvées
      query.approuve = true;
      query.statut = "approuve";
    } else if (req.user.role === "client") {
      // Client : seulement salles approuvées
      query.approuve = true;
      query.statut = "approuve";
    } else if (req.user.role === "proprietaire") {
      // Propriétaire : ses salles + salles approuvées
      query = {
        $or: [
          { proprietaire: req.user.id },
          { approuve: true, statut: "approuve" },
        ],
      };
    }
    // Admin voit tout (pas de filtre)

    // Recherche textuelle
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      const searchCondition = {
        $or: [
          { titre: searchRegex },
          { description: searchRegex },
          { "localisation.ville": searchRegex },
        ],
      };

      if (query.$or) {
        query = {
          $and: [{ $or: query.$or }, searchCondition],
        };
      } else {
        query = { ...query, ...searchCondition };
      }
    }

    // Filtres supplémentaires
    let dbQuery = Room.find(query);

    if (req.query.capacite) {
      dbQuery = dbQuery.where("capacite").gte(req.query.capacite);
    }

    if (req.query.prixMax) {
      dbQuery = dbQuery.where("prix").lte(req.query.prixMax);
    }

    if (req.query.prixMin) {
      dbQuery = dbQuery.where("prix").gte(req.query.prixMin);
    }

    // Recherche par proximité
    if (req.query.latitude && req.query.longitude) {
      const lat = parseFloat(req.query.latitude);
      const lng = parseFloat(req.query.longitude);
      const maxDistance = req.query.distance
        ? parseFloat(req.query.distance) * 1000
        : 50000; // Défaut 50km

      dbQuery = Room.find({
        ...query,
        "localisation.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: maxDistance,
          },
        },
      });
    }

    // Tri
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      dbQuery = dbQuery.sort(sortBy);
    } else {
      dbQuery = dbQuery.sort("-dateCreation");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    dbQuery = dbQuery.skip(startIndex).limit(limit);

    // Populate
    dbQuery = dbQuery.populate("proprietaire", "nom prenom email telephone");

    // Exécuter la requête
    const rooms = await dbQuery;
    const total = await Room.countDocuments(query);

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      pagination,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une salle par ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("proprietaire", "nom prenom email telephone")
      .populate({
        path: "avis",
        populate: {
          path: "client",
          select: "nom prenom",
        },
        options: { sort: { dateCreation: -1 } },
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Salle non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer une nouvelle salle
// @route   POST /api/rooms
// @access  Private (Propriétaire)
exports.createRoom = async (req, res, next) => {
  try {
    req.body.proprietaire = req.user.id;
    req.body.approuve = false;
    req.body.statut = "en_attente";

    // Convertir les coordonnées au format GeoJSON
    if (
      req.body.localisation &&
      req.body.localisation.latitude &&
      req.body.localisation.longitude
    ) {
      req.body.localisation.coordinates = {
        type: "Point",
        coordinates: [
          parseFloat(req.body.localisation.longitude),
          parseFloat(req.body.localisation.latitude),
        ],
      };
      delete req.body.localisation.latitude;
      delete req.body.localisation.longitude;
    }

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message:
        "Salle créée avec succès. Elle sera visible après approbation par un administrateur.",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une salle
// @route   PUT /api/rooms/:id
// @access  Private (Propriétaire)
exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Salle non trouvée",
      });
    }

    // Vérifier les permissions
    if (
      room.proprietaire.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier cette salle",
      });
    }

    // Si propriétaire modifie, remettre en attente
    if (req.user.role === "proprietaire") {
      req.body.approuve = false;
      req.body.statut = "en_attente";
    }

    // Convertir les coordonnées si nécessaire
    if (
      req.body.localisation &&
      req.body.localisation.latitude &&
      req.body.localisation.longitude
    ) {
      req.body.localisation.coordinates = {
        type: "Point",
        coordinates: [
          parseFloat(req.body.localisation.longitude),
          parseFloat(req.body.localisation.latitude),
        ],
      };
      delete req.body.localisation.latitude;
      delete req.body.localisation.longitude;
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Salle mise à jour",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une salle
// @route   DELETE /api/rooms/:id
// @access  Private (Propriétaire/Admin)
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Salle non trouvée",
      });
    }

    if (
      room.proprietaire.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à supprimer cette salle",
      });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: "Salle supprimée",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les salles d'un propriétaire
// @route   GET /api/rooms/owner/me
// @access  Private (Propriétaire)
exports.getOwnerRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ proprietaire: req.user.id }).sort(
      "-dateCreation",
    );

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approuver une salle (Admin)
// @route   PUT /api/rooms/:id/approve
// @access  Private (Admin)
exports.approveRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { approuve: true, statut: "approuve" },
      { new: true },
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Salle non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salle approuvée",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rejeter une salle (Admin)
// @route   PUT /api/rooms/:id/reject
// @access  Private (Admin)
exports.rejectRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { approuve: false, statut: "rejete" },
      { new: true },
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Salle non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salle rejetée",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les salles en attente (Admin)
// @route   GET /api/rooms/pending
// @access  Private (Admin)
exports.getPendingRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ statut: "en_attente" })
      .populate("proprietaire", "nom prenom email")
      .sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};
