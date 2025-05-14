const router = require("express").Router();

const { create, verify } = require("../controllers/tokenAdsController.js");
const { filterAdmin } = require("./filterAuth.js");

router.post("/", create);
router.post("/verify", verify);

module.exports = router;
