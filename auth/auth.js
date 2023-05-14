const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../db");

// Определение стратегии аутентификации
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.getUserByUsername(username);

      if (!user) {
        return done(null, false, { message: "Неверное имя пользователя" });
      }

      const isPasswordValid = await db.comparePassword(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: "Неверный пароль" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);
