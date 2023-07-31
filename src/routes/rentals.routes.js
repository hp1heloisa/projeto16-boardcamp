import { Router } from "express";
import { getRentals, postRental } from "../controllers/rentals.controllers.js";
import { validateClient, validateGame } from "../middlewares/validateRental.middleware.js";

const rentalsRouter = Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals',validateClient, validateGame,postRental);

export default rentalsRouter;