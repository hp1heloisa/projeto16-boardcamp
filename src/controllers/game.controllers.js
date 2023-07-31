import { db } from "../database/database.connection.js";

export async function getGames(req, res) {
    const { order, desc, name } = req.query; 
    try {
        let requisicao = 'SELECT * FROM games';
        if (name) {
            requisicao += ` WHERE LOWER(name) LIKE LOWER('${name}%')`;
        }
        if (order) {
            if (desc){
                requisicao += ` ORDER BY "${order}" DESC;`;
            } else{
                requisicao += ` ORDER BY "${order}" ASC;`
            }
        }
        const games = await db.query(requisicao);
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