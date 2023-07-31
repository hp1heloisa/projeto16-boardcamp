import { db } from "../database/database.connection.js";

export async function getRentals(req,res) {
    try {
        const rentals = await db.query(`
            SELECT rentals.*, customers.name as customer, 
            games.name as game FROM rentals JOIN customers ON 
            rentals."customerId" = customers.id JOIN games ON rentals."gameId"=games.id;
        `);
        rentals.rows.forEach(rental => {
            const rentDate = new Date(rental.rentDate);
            rental.rentDate = `${rentDate.getFullYear()}-${String(rentDate.getMonth() + 1).padStart(2, '0')}-${String(rentDate.getDate()).padStart(2, '0')}`
            rental.customer = [rental.customerId, rental.customer];
            rental.game = [rental.gameId, rental.game];
            if (rental.returnDate) {
                const returnDate = new Date(rental.returnDate);
                rental.returnDate = `${returnDate.getFullYear()}-${String(returnDate.getMonth() + 1).padStart(2, '0')}-${String(returnDate.getDate()).padStart(2, '0')}`
                  
            }
        })
        res.send(rentals.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function postRental(req, res){
    const { customerId, gameId, daysRented } = req.body;
    if (daysRented <= 0) return res.status(400).send('daysRented deve ser maior que zero!');
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

export async function returnRental(req, res) {
    const { id } = req.params;
    try {
        const rental = await db.query(`SELECT * FROM rentals WHERE id=$1`, [id]);
        if (!rental.rows[0]) return res.sendStatus(404);
        if (rental.rows[0].returnDate) return res.sendStatus(400);

        const returnDate = new Date();
        let late =  Math.floor(Math.abs(returnDate - rental.rows[0].rentDate)/(24 * 60 * 60 * 1000));
        let delayFee = 0;
        if (late - rental.rows[0].daysRented > 0){
            delayFee = (late - rental.rows[0].daysRented)*rental.rows[0].originalPrice;
        }
        await db.query(`UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id=$3`, [returnDate,delayFee,id]);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
}