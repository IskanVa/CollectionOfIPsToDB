const express = require("express");
const sourceRouter = require("./routes/user.routes");
const authRouter = require("./routes/auth.routes");
const path = require("path");

const PORT = 8000;
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Маршрут для отображения HTML-страницы
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Маршруты для аутентификации
app.use("/api/auth", authRouter); // Используйте authRouter

// Маршрут для создания нового источника
app.use("/api", sourceRouter);

app.listen(PORT, () => {
  console.log(`Приложение запущено на порту: ${PORT}`);
});
