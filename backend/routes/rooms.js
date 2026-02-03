const express = require("express");
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getOwnerRooms,
  approveRoom,
  rejectRoom,
  getPendingRooms,
} = require("../controllers/roomController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Route pour gérer l'authentification optionnelle
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    return protect(req, res, next);
  }
  next();
};

router
  .route("/")
  .get(optionalAuth, getRooms)
  .post(protect, authorize("proprietaire", "admin"), createRoom);

router
  .route("/owner/me")
  .get(protect, authorize("proprietaire", "admin"), getOwnerRooms);

router.route("/pending").get(protect, authorize("admin"), getPendingRooms);

router.route("/:id/approve").put(protect, authorize("admin"), approveRoom);

router.route("/:id/reject").put(protect, authorize("admin"), rejectRoom);

router
  .route("/:id")
  .get(getRoom)
  .put(protect, authorize("proprietaire", "admin"), updateRoom)
  .delete(protect, authorize("proprietaire", "admin"), deleteRoom);

module.exports = router;
