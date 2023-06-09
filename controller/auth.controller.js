const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Проверяем длину пароля и имени пользователя
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Длина пароля должна быть не менее 8 символов" });
      }

      if (username.length < 5) {
        return res.status(400).json({
          message: "Длина имени пользователя должна быть не менее 5 символов",
        });
      }

      // Проверяем валидность email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Некорректный email" });
      }

      // Проверяем, есть ли пользователь с таким email в базе данных
      const existingUser = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          message: "Пользователь с таким email уже зарегистрирован",
        });
      }

      // Хэшируем пароль перед сохранением в базу данных
      const hashedPassword = await bcrypt.hash(password, 10);

      // Вставляем нового пользователя в базу данных
      await db.query(
        "INSERT INTO users (username, email, password_hash, roles) VALUES ($1, $2, $3, $4)",
        [username, email, hashedPassword, ["defaultuser"]]
      );

      res.status(201).json({ message: "Регистрация прошла успешно" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows.length === 0) {
        return res.status(401).json({ message: "Неверные учетные данные" });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        user.rows[0].password_hash
      );
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Неверные учетные данные" });
      }

      const ip = req.ip; // Получаем IP-адрес

      // Обновляем запись пользователя в базе данных, установив IP
      await db.query("UPDATE users SET ip = $1 WHERE email = $2", [ip, email]);

      const token = jwt.sign({ userId: user.rows[0].id }, "secret_key", {
        expiresIn: "30d",
      });

      res.status(200).json({ token, ip: ip });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new AuthController();
