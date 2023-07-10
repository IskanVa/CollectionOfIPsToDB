const db = require("../db");

class SourceController {
  async createSource(req, res) {
    console.log("Request body:", req.body);
    let client;
    try {
      const { source, ips, team } = req.body;
      if (!source || !ips || !team) {
        return res
          .status(400)
          .json({ message: "Не заполнены все обязательные поля" });
      }
      client = await db.connect();
      await client.query("BEGIN");

      const existingTeam = await client.query(
        "SELECT * FROM teams WHERE name = $1 AND email = $2",
        [team, source]
      );
      console.log("Existing team:", existingTeam.rows);
      if (existingTeam.rowCount === 0) {
        return res.status(400).json({ message: "Команда не найдена" });
      }

      const ipsArray = ips.map((ip) => (ip ? `${ip}` : ""));

      for (const ip of ipsArray) {
        const existingPenalty = await client.query(
          "SELECT * FROM penalties WHERE ip = $1 AND added_by = $2 AND team_name = $3",
          [ip, source, team]
        );

        if (existingPenalty.rowCount === 0) {
          await client.query(
            "INSERT INTO penalties (ip, rating, added_by, team_name) VALUES ($1, 1, $2, $3)",
            [ip, source, team]
          );
          console.log("Inserted penalty for IP:", ip);
        }

        const summaryResult = await client.query(
          "SELECT * FROM penalties_summary WHERE ip = $1",
          [ip]
        );

        const penaltiesCountResult = await client.query(
          "SELECT COUNT(*) FROM penalties WHERE ip = $1",
          [ip]
        );

        const penaltiesCount = parseInt(penaltiesCountResult.rows[0].count);

        if (summaryResult.rowCount > 0) {
          const currentRating = parseInt(summaryResult.rows[0].rating);

          if (currentRating < penaltiesCount) {
            await client.query(
              "UPDATE penalties_summary SET rating = rating + 1 WHERE ip = $1",
              [ip]
            );
          }
        } else {
          await client.query(
            "INSERT INTO penalties_summary (ip, rating, added_by, team_name) VALUES ($1, 1, $2, $3)",
            [ip, source, team]
          );
        }
      }
      await client.query("COMMIT");
      res.status(201).json({
        message: "IPs added successfully",
        source: {
          added_by: source,
          team_name: team,
          ips: ipsArray,
        },
      });
    } catch (error) {
      console.error(error);
      if (client) {
        await client.query("ROLLBACK");
      }
      res.status(500).json({ message: "Internal server error" });
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async createTeam(req, res) {
    let client;
    client = await db.connect();
    const { name, email } = req.body;

    // Проверка наличия всех обязательных полей
    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Не заполнены все обязательные поля" });
    }

    // Проверка на существование пользователя
    const existingUser = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount === 0) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    // Проверка на существование команды с таким именем
    const existingTeam = await client.query(
      "SELECT * FROM teams WHERE name = $1 AND email = $2",
      [name, email]
    );

    if (existingTeam.rowCount > 0) {
      return res.status(400).json({ message: "Команда уже существует" });
    }

    // Создание новой команды
    const result = await client.query(
      "INSERT INTO teams (name, email) VALUES ($1, $2) RETURNING id",
      [name, email]
    );

    const teamId = result.rows[0].id;
    res.status(201).json({
      message: "Команда успешно создана",
      team: { id: teamId, name, email },
    });
  }

  async getSource(req, res) {
    let client = null;
    try {
      client = await db.connect();
      let query = "SELECT * FROM penalties_summary";
      const { rating } = req.query;

      if (rating) {
        query += ` WHERE rating = ${rating}`;
      }
      query += " ORDER BY rating DESC";

      const result = await client.query(query);
      const sources = result.rows.map((row) => ({
        ip: row.ip,
        rating: row.rating,
      }));

      res.status(200).json({ sources });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async validateTeam(req, res) {
    let client;
    client = await db.connect();
    const { teamName } = req.body;
    console.log(teamName);

    // Проверка наличия всех обязательных полей
    if (!teamName) {
      return res
        .status(400)
        .json({ message: "Не заполнены все обязательные поля - Имя команды" });
    }

    // Проверка на существование команды с указанным именем для указанного пользователя
    const existingTeam = await client.query(
      "SELECT * FROM teams WHERE name = $1",
      [teamName]
    );
    console.log(`existingTeam - ${existingTeam.rowCount}`);

    if (existingTeam.rowCount === 0) {
      return res.status(400).json({ message: "Команда не найдена" });
    }

    // Если все проверки пройдены, возвращаем успех
    res.status(200).json({
      message: "Команда найдена",
      team: existingTeam.rows[0],
      isValid: true,
    });
  }

  async getOneSource(req, res) {}
  async updateSource(req, res) {}
  async deleteSource(req, res) {}
}

module.exports = new SourceController();
