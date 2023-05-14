const express = require("express");
const sourceRouter = require("./routes/user.routes");
const path = require("path");

const PORT = 8000;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Маршрут для отображения HTML-страницы
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Маршрут для создания нового источника
app.use("/api/sources", sourceRouter);

app.listen(PORT, () => {
  console.log(`Порт ему нужен, ну ладно: ${PORT}`);
});
