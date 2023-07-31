import { db } from "../database/database.connection.js";

export async function validateClient(req, res, next){
    const { customerId } = req.body
    try {
        const customerOk = await db.query(`SELECT * FROM customers WHERE id=$1`, [customerId]);
        console.log(customerOk.rows)
        if (customerOk.rows.length < 1) return res.sendStatus(400);
    } catch (error) {
        res.status(500).send(error.message);
    }
    next();
}

export async function validateGame(req, res, next){
    const { gameId } = req.body
    try {
        const gameOk = await db.query(`SELECT * FROM games WHERE id=$1`, [gameId]);
        console.log(gameOk.rows)
        if (gameOk.rows.length < 1) return res.sendStatus(400);
    } catch (error) {
        res.status(500).send(error.message);
    }
    next();
}