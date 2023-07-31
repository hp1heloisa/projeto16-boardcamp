import { Router } from "express";
import { getGames, postGame } from "../controllers/game.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { gamePostSchema } from "../schemas/game.schema.js";

const gamesRouter = Router();

gamesRouter.get('/games', getGames);
gamesRouter.post('/games', validateSchema(gamePostSchema),postGame);

export default gamesRouter;