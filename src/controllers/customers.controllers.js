import { db } from "../database/database.connection.js";

export async function getCustomers(req, res) {
    const { order, desc, cpf, offset, limit } = req.query; 
    try {
        let requisicao = 'SELECT * FROM customers';
        if (cpf) {
            requisicao += ` WHERE cpf LIKE '${cpf}%'`;
        }
        if (order) {
            if (desc){
                requisicao += ` ORDER BY ${order} DESC`;
            } else{
                requisicao += ` ORDER BY ${order} ASC`
            }
        } 
        if (offset) {
            requisicao += ` OFFSET ${offset}`;
        }
        if (limit) {
            requisicao += ` LIMIT ${limit}`;
        }
        const customers = await db.query(requisicao);
        customers.rows.forEach(customer => {
            const birthday = new Date(customer.birthday);
            customer.birthday = `${birthday.getFullYear()}-${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`
        })
        res.send(customers.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getCustomersById(req, res) {
    const { id } = req.params;
    try {
        const customers = await db.query('SELECT * FROM customers WHERE id=$1', [id]);
        if (!customers.rows[0]) return res.sendStatus(404);
        const birthday = new Date(customers.rows[0].birthday);
        customers.rows[0].birthday = `${birthday.getFullYear()}-${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`
        res.send(customers.rows[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function postCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    try {
        const existe = await db.query(`
            SELECT * FROM customers WHERE cpf=$1
        `, [cpf]);
        if (existe.rows.length > 0) return res.sendStatus(409);
        await db.query(`
            INSERT INTO customers (name, phone, cpf, birthday) VALUES 
            ($1,$2,$3,$4);
        `, [name, phone, cpf, birthday]);
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function editCustomer(req, res) {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;
    try {
        const existe = await db.query(`
            SELECT * FROM customers WHERE cpf=$1
        `, [cpf]);
        if (existe.rows.length > 0){
            if (existe.rows[0].id != id) return res.sendStatus(409);
        }

        await db.query(`
            UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5
        `, [name, phone, cpf, birthday, id])
        

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
}