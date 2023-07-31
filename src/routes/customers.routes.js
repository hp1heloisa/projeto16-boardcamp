import { Router } from "express";
import { editCustomer, getCustomers, getCustomersById, postCustomer } from "../controllers/customers.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { customerPostSchema } from "../schemas/customers.schema.js";

const customersRoutes = Router();

customersRoutes.get('/customers', getCustomers);
customersRoutes.get('/customers/:id', getCustomersById);
customersRoutes.post('/customers', validateSchema(customerPostSchema), postCustomer);
customersRoutes.put('/customers/:id', validateSchema(customerPostSchema), editCustomer)

export default customersRoutes;