const puppeteer = require("puppeteer");
const Scrape = require("../models/scrapemodels");
const validator = require("validator");

const scrapeWebsite = async (req, res) => {
  const { url } = req.body;

  // Validación de URL
  if (!url || !validator.isURL(url)) {
    return res
      .status(400)
      .json({ error: "Por favor, proporciona una URL válida." });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    // Extraer los datos
    const data = await page.evaluate(() => {
      const headlines = Array.from(document.querySelectorAll("h1, h2, h3")).map(
        (el) => el.innerText.trim()
      );
      const descriptions = Array.from(document.querySelectorAll("p")).map(
        (el) => el.innerText.trim()
      );

      return headlines
        .map((headline, index) => ({
          headline,
          description: descriptions[index] || "Descripción no disponible",
        }))
        .filter((item) => item.headline);
    });

    await browser.close();

    // Guardar los datos en la tabla "scrape"
    const scrapeRecord = await Scrape.create({
      url,
      scraped_at: new Date(),
      data: JSON.stringify(data, null, 2),
    });

    // Responder con los datos scrapeados y los guardados en la base de datos.
    res.json({
      message: "Scraping realizado y datos guardados",
      scraped_data: data,
      database_record: {
        id: scrapeRecord.id,
        url: scrapeRecord.url,
        scraped_at: scrapeRecord.scraped_at,
        data: JSON.parse(scrapeRecord.data),
      },
    });
  } catch (error) {
    console.error("Error en el scraping:", error.message);
    res
      .status(500)
      .json({
        error: "No se pudo realizar el scraping.",
        details: error.message,
      });
  }
};

module.exports = {
  scrapeWebsite,
};
