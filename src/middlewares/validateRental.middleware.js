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
        res.locals.game = gameOk.rows[0];
    } catch (error) {
        res.status(500).send(error.message);
    }
    next();
}

export async function validateDisponibility(req, res, next) {
    const { gameId } = req.body;
    const { game } = res.locals;
    try {
        const rentalsGameTotal = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1`, [gameId]);
        const rentalsGameNull = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1 AND "returnDate" IS NOT NULL`, [gameId]);
        console.log('aqui');
        console.log(game);
        console.log(rentalsGameTotal.rows.length);
        console.log(rentalsGameNull.rows.length);

        if (rentalsGameTotal.rows.length - rentalsGameNull.rows.length >= game.stockTotal) return res.status(400).send('Jogo indisponível');

    } catch (error) {
        res.status(500).send(error.message);
    }
    next();
}