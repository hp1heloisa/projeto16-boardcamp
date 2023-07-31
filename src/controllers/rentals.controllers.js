import { db } from "../database/database.connection.js";

export async function getRentals(req,res) {
    try {
        const rentals = await db.query(`
            SELECT rentals.*, customers.name as customer, 
            games.name as game FROM rentals JOIN customers ON 
            rentals."customerId" = customers.id JOIN games ON rentals."gameId"=games.id;
        `);
        rentals.rows.forEach(rental => {
            rental.customer = [rental.customerId, rental.customer];
            rental.game = [rental.gameId, rental.game];
        })
        res.send(rentals.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function postRental(req, res){
    const { customerId, gameId, daysRented } = req.body;
    if (daysRented <= 0) return res.sendStatus(400);
    try {
        const game = await db.query(`SELECT * FROM games WHERE id=$1`, [gameId]);
        const rentDate = new Date();
        const originalPrice = daysRented*game.rows[0].pricePerDay;
        await db.query(`
            INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
            VALUES ($1,$2,$3,$4, null, $5, null);
        `, [customerId, gameId, rentDate, daysRented, originalPrice]);
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}