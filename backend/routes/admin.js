const express = require("express");
const {
  getOwnerStats,
  getAdminStats,
  getUsers,
  toggleUserStatus,
  deleteUser,
  getAllRooms,
  getAllReviews,
  deleteReview,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Routes statistiques
router
  .route("/stats/owner")
  .get(protect, authorize("proprietaire", "admin"), getOwnerStats);

router.route("/stats/admin").get(protect, authorize("admin"), getAdminStats);

// Routes utilisateurs
router.route("/users").get(protect, authorize("admin"), getUsers);

router
  .route("/users/:id/toggle")
  .put(protect, authorize("admin"), toggleUserStatus);

router.route("/users/:id").delete(protect, authorize("admin"), deleteUser);

// Routes salles
router.route("/rooms").get(protect, authorize("admin"), getAllRooms);

// Routes avis
router.route("/reviews").get(protect, authorize("admin"), getAllReviews);

router.route("/reviews/:id").delete(protect, authorize("admin"), deleteReview);

module.exports = router;
