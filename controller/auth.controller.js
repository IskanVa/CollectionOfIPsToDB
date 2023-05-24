const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      console.log(username);
      console.log(email);
      console.log(password);

      // Проверяем, есть ли пользователь с таким email в базе данных
      const existingUser = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким email уже зарегистрирован" });
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

      // Проверяем, существует ли пользователь с указанным email
      const user = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows.length === 0) {
        return res.status(401).json({ message: "Неверные учетные данные" });
      }

      // Сравниваем хэшированный пароль из базы данных с введенным паролем
      const isPasswordMatch = await bcrypt.compare(
        password,
        user.rows[0].password_hash
      );
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Неверные учетные данные" });
      }

      // Генерируем JWT-токен для аутентификации пользователя
      const token = jwt.sign({ userId: user.rows[0].id }, "secret_key", {
        expiresIn: "30d",
      });

      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Добавьте другие методы для работы с аутентификацией, если необходимо
}

module.exports = new AuthController();
