import { Router } from "express";
import { getRentals, postRental, returnRental } from "../controllers/rentals.controllers.js";
import { validateClient, validateDisponibility, validateGame } from "../middlewares/validateRental.middleware.js";

const rentalsRouter = Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals',validateClient, validateGame, validateDisponibility, postRental);
rentalsRouter.post('/rentals/:id/return', returnRental)

export default rentalsRouter;