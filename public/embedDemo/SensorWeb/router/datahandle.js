const express = require("express");
const router = express.Router();
const data_arbeiten = require("../router_handler/datahandle");

router.post(
    "/dataSave",
    data_arbeiten.dataSave
);
router.get(
    "/temupdatesensordata",
    data_arbeiten.getdatatemp
);

module.exports = router;

