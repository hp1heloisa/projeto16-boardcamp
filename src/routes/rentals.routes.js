import { Router } from "express";
import { deleteRental, getRentals, postRental, returnRental } from "../controllers/rentals.controllers.js";
import { validateClient, validateDisponibility, validateGame, validateRental } from "../middlewares/validateRental.middleware.js";

const rentalsRouter = Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals',validateClient, validateGame, validateDisponibility, postRental);
rentalsRouter.post('/rentals/:id/return', validateRental,returnRental);
rentalsRouter.delete('/rentals/:id', validateRental,deleteRental);

export default rentalsRouter;