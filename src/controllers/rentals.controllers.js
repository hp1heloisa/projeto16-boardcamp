import { db } from "../database/database.connection.js";

export async function getRentals(req,res) {
    const { order, desc, customerId, gameId, offset, limit, status, startDate } = req.query; 
    try {
        let requisicao = `
            SELECT rentals.*, customers.name as customer, 
            games.name as game FROM rentals JOIN customers ON 
            rentals."customerId" = customers.id JOIN games ON rentals."gameId"=games.id
        `
        if (customerId) {
            requisicao += ` WHERE "customerId"=${customerId}`;
        }
        if (gameId) {
            requisicao += ` WHERE "gameId"=${gameId}`;
        }
        if (status){
            if (status  == 'open'){
                requisicao += `WHERE "returnDate" IS NULL`;
            } else if (status == 'closed') {
                requisicao += `WHERE "returnDate" IS NOT NULL`;
            }
            if (startDate){
                let data = new Date(startDate);
                requisicao += ` AND "rentDate">='${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()+1).padStart(2, '0')}'`;
            
            }
        } 
        if (startDate && !status){
            let data = new Date(startDate);
            requisicao += `WHERE "rentDate">='${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()+1).padStart(2, '0')}'`;
        }
        if (order) {
            if (desc){
                requisicao += ` ORDER BY "${order}" DESC`
            } else{
                requisicao += ` ORDER BY "${order}" ASC`
            }
        }
        if (offset) {
            requisicao += ` OFFSET ${offset}`;
        }
        if (limit) {
            requisicao += ` LIMIT ${limit}`;
        }
        console.log(requisicao)
        const rentals = await db.query(requisicao);
        rentals.rows.forEach(rental => {
            const rentDate = new Date(rental.rentDate);
            rental.rentDate = `${rentDate.getFullYear()}-${String(rentDate.getMonth() + 1).padStart(2, '0')}-${String(rentDate.getDate()).padStart(2, '0')}`
            rental.customer = {id: rental.customerId, name: rental.customer};
            rental.game = {id: rental.gameId, name: rental.game};
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
    const { rental } = res.locals;
    try {
        const returnDate = new Date();
        let late =  Math.floor(Math.abs(returnDate - rental.rentDate)/(24 * 60 * 60 * 1000));
        let delayFee = 0;
        if (late - rental.daysRented > 0){
            let game = await db.query(`SELECT * FROM games WHERE id=$1`, [rental.gameId]);
            delayFee = (late - rental.daysRented)*game.rows[0].pricePerDay;
        }
        await db.query(`UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id=$3`, [returnDate,delayFee,id]);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function deleteRental(req, res) {
    const { id } = req.params;
    try {
        console.log(res.locals);
        await db.query(`DELETE FROM rentals WHERE id=$1`, [id]);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
}