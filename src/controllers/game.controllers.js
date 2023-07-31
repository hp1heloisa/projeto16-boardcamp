import { db } from "../database/database.connection.js";

export async function getGames(req, res) {
    const { order, desc } = req.query; 
    console.log(req.query);
    try {
        const games = await db.query('SELECT * FROM games');
        res.send(games.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function postGame(req, res) {
    const {name, image, stockTotal, pricePerDay} = req.body;
    try {
        const existe = await db.query(`
            SELECT * FROM games WHERE name=$1
        `, [name]);
        if (existe.rows.length > 0) return res.sendStatus(409);

        const post = await db.query(`
            INSERT INTO games (name, image, "stockTotal", "pricePerDay")  VALUES ($1,$2,$3,$4)
        `, [name, image, stockTotal, pricePerDay]);
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}