const express = require("express");
const {
  createReview,
  getRoomReviews,
  updateReview,
  deleteReview,
  getOwnerRoomReviews,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.route("/").post(protect, authorize("client"), createReview);

router.route("/room/:roomId").get(getRoomReviews);

router
  .route("/owner/me")
  .get(protect, authorize("proprietaire", "admin"), getOwnerRoomReviews);

router
  .route("/:id")
  .put(protect, authorize("client", "admin"), updateReview)
  .delete(protect, authorize("client", "admin"), deleteReview);

module.exports = router;
