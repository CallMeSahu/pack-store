const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hey Owner!");
});

module.exports = router;