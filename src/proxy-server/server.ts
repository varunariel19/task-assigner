import MainRouter from "./routes/route";
import express from "express";
import dotenv from "dotenv";


const handleCreateServer = async () => {

    dotenv.config();

    const app = express();
    app.use(express.json());

    app.use("/api", MainRouter);


    return app;

}


export { handleCreateServer }

