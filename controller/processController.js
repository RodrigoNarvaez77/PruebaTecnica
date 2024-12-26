const { HfInference } = require("@huggingface/inference");
const TextProcessing = require("../models/processmodels"); // Modelo de Sequelize

// Instancia de Hugging Face API
const hf = new HfInference(process.env.APIHUGGINGFACE); // Asegúrate de que la API Key esté configurada correctamente

// Función para truncar texto
const truncateText = (text, maxLength = 255) => {
  return text.length > maxLength ? text.substring(0, maxLength) : text;
};

const processText = async (req, res) => {
  const { text, task } = req.body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "El campo 'text' es obligatorio y debe ser una cadena válida." });
  }

  if (!task || (task !== "sentiment-analysis" && task !== "summarization")) {
    return res.status(400).json({ error: "La tarea debe ser 'sentiment-analysis' o 'summarization'." });
  }

  try {
    let result;
    let sentiment = null;
    let score = null;
    let summary = null;

    if (task === "sentiment-analysis") {
      // Análisis de sentimiento
      result = await hf.textClassification({
        model: "nlptown/bert-base-multilingual-uncased-sentiment",
        inputs: text,
      });

      const topResult = result.reduce((prev, current) => (prev.score > current.score ? prev : current));
      sentiment = topResult.label;
      score = topResult.score;

    } else if (task === "summarization") {
      // Resumen de texto
      result = await hf.summarization({
        model: "facebook/bart-large-cnn",
        inputs: text,
      });

      if (result && result.summary_text) {
        summary = result.summary_text;
      } else {
        return res.status(500).json({ error: "La API de Hugging Face no devolvió un resumen válido." });
      }
    }

    // Guardar los resultados en la base de datos
    const savedRecord = await TextProcessing.create({
      headline: truncateText(text), // Truncar texto si es necesario
      sentiment: sentiment,
      score: score,
      summary: summary,
    });

    // Respuesta al cliente
    res.json({
      message: "Texto procesado y resultado almacenado.",
      task,
      input: text,
      output: task === "sentiment-analysis"
        ? { sentiment, score }
        : { summary },
      recordId: savedRecord.id,
    });

  } catch (error) {
    console.error("Error al procesar el texto:", error.message);
    res.status(500).json({ error: "No se pudo procesar el texto." });
  }
};

module.exports = {
  processText,
};
