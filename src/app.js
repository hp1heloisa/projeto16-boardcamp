import express, { json } from "express";
import cors from "cors";
import router from "./routes/index.routes.js";

const app = express();
app.use(cors());
app.use(json());
app.use(router);


const port = 5005;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})