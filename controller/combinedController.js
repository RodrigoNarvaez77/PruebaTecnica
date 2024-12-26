const puppeteer = require("puppeteer"); // Importa Puppeteer correctamente
const { HfInference } = require("@huggingface/inference");
const Combined = require("../models/combinedmodels"); // Importa el modelo de la tabla Combined

// Instancia de Hugging Face
const hf = new HfInference(process.env.APIHUGGINGFACE);

const combined = async (req, res) => {
  const { url, task } = req.body;

  // Validación de entrada
  if (!url || !task) {
    return res.status(400).json({
      error: "Por favor, proporciona una URL y una tarea válida ('sentiment-analysis' o 'summarization').",
    });
  }

  try {
    // Paso 1: Scraping de la página
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extraer datos de la página
    const scrapedData = await page.evaluate(() => {
      const headlines = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((el) => el.innerText.trim())
        .filter((text) => text.length > 0);

      const descriptions = Array.from(document.querySelectorAll("p"))
        .map((el) => el.innerText.trim())
        .filter((text) => text.length > 20);

      return headlines.map((headline, index) => ({
        headline,
        description: descriptions[index] || "Descripción no disponible",
      }));
    });

    await browser.close(); // Cierra el navegador

    // Filtrar datos relevantes
    const filteredData = scrapedData.filter(
      (item) =>
        item.headline.trim() !== "" &&
        item.description.trim() !== "" &&
        item.description.length > 20
    );

    if (filteredData.length === 0) {
      return res.status(404).json({ error: "No se encontraron datos relevantes en la página." });
    }

    // Paso 2: Procesamiento con IA
    const processedData = await Promise.all(
      filteredData.map(async (item) => {
        try {
          let result = null;

          if (task === "sentiment-analysis") {
            // Análisis de sentimiento
            const sentimentResults = await hf.textClassification({
              model: "nlptown/bert-base-multilingual-uncased-sentiment",
              inputs: item.headline,
            });
            const bestSentiment = sentimentResults.sort((a, b) => b.score - a.score)[0];
            result = {
              sentiment: bestSentiment.label,
              score: bestSentiment.score,
            };
          } else if (task === "summarization") {
            // Resumir texto
            const summaryResult = await hf.summarization({
              model: "mrm8488/bert2bert_shared-spanish-finetuned-summarization",
              inputs: item.description,
            });
            result = { summary: summaryResult.summary_text };
          } else {
            throw new Error("Tarea no válida. Usa 'sentiment-analysis' o 'summarization'.");
          }

          // Guardar en la base de datos
          await Combined.create({
            url,
            headline: item.headline,
            description: item.description,
            task,
            sentiment: result.sentiment || null,
            score: result.score || null,
            summary: result.summary || null,
          });

          return { ...item, processed: result };
        } catch (err) {
          console.error(`Error procesando item: ${item.headline}`, err.message);

          // Guardar el error en la base de datos
          await Combined.create({
            url,
            headline: item.headline,
            description: item.description,
            task,
            error: err.message,
          });

          return { ...item, processed: null, error: err.message };
        }
      })
    );

    // Paso 3: Respuesta al cliente
    res.json({
      url,
      scraped_at: new Date().toISOString(),
      data: processedData,
    });
  } catch (error) {
    console.error("Error en el endpoint /combined:", error.message);
    res.status(500).json({ error: "Ocurrió un error al procesar la solicitud." });
  }
};

module.exports = {
  combined,
};
