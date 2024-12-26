const express = require("express");
const { scrapeWebsite } = require("../controller/scrapeController");
const { processText } = require("../controller/processController");
const { combined } = require("../controller/combinedController");

const router = express.Router();

// Ruta para realizar el scraping Punto 1
router.post("/scrape", scrapeWebsite);

// Ruta para procesar texto Punto 2
router.post("/process", processText);

//Ruta para procesar punto 3 combiando
router.post("/combined",combined);

module.exports = router;