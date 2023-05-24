const db = require("../db");

class SourceController {
  async createSource(req, res) {
    let client;
    try {
      const { source, ips } = req.body;
      console.log(source);
      console.log(ips);

      if (!source || !ips) {
        return res
          .status(400)
          .json({ message: "Не заполнены все обязательные поля" });
      }
      client = await db.connect();
      await client.query("BEGIN"); // начинаем транзакцию

      // Convert ips object to array of CIDR
      const ipsArray = ips.map((ip) => (ip ? `${ip}` : ""));

      const result = await client.query(
        "INSERT INTO uploadList (added_by, ips) VALUES ($1, $2) RETURNING id",
        [source, ipsArray]
      );

      const sourceId = result.rows[0].id;

      // Перебираем ip из списка и проверяем, есть ли они уже в таблице penalties
      for (const ip of ipsArray) {
        const existingPenalty = await client.query(
          "SELECT * FROM penalties WHERE ip = $1",
          [ip]
        );

        if (existingPenalty.rowCount > 0) {
          // Если запись уже есть в penalties, то увеличиваем значение поля rating на 1
          await client.query(
            "UPDATE penalties SET rating = rating + 1 WHERE ip = $1",
            [ip]
          );
        } else {
          // Если записи в penalties нет, то добавляем новую запись с rating = 1
          await client.query(
            "INSERT INTO penalties (ip, source_id, added_by) VALUES ($1, $2, $3)",
            [ip, sourceId, source]
          );
        }
      }

      await client.query("COMMIT"); // сохраняем транзакцию
      res.status(201).json({
        message: "IPs added successfully",
        source: { id: sourceId, added_by: source, ips: ipsArray },
      });
    } catch (error) {
      console.error(error);
      await client.query("ROLLBACK"); // откатываем транзакцию при ошибке
      res.status(500).json({ message: "Internal server error" });
    } finally {
      if (client) {
        try {
          client.release();
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  // async getSource(req, res) {
  //   let client = null; // Инициализация переменной client

  //   try {
  //     client = await db.connect();
  //     const result = await client.query(
  //       "SELECT * FROM penalties ORDER BY rating DESC"
  //     );

  //     const sources = result.rows.map((row) => ({
  //       ip: row.ip,
  //       rating: row.rating,
  //     }));

  //     res.status(200).json({ sources });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: "Internal server error" });
  //   } finally {
  //     if (client) {
  //       client.release();
  //     }
  //   }
  // }
  async getSource(req, res) {
    let client = null;

    try {
      client = await db.connect();

      let query = "SELECT * FROM penalties";
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

  async getOneSource(req, res) {}
  async updateSource(req, res) {}
  async deleteSource(req, res) {}
}

module.exports = new SourceController();
