import express from "express";
import {
    handleCreateNewTask,
    handleFetchAllUsers,
    handleFetchAllTask,
    handleUpdateTicket,
    handleRegister,
    handleLogin,
} from "../handlers";
import { handleValidateToken } from "../authentication/auth";
import { handleAddComment, handleEditComment, handleFetchAllComments } from "../handlers/comment";

const Router = express.Router();

Router.get("/comments/:taskId", (req, res) => handleFetchAllComments(req, res));
Router.post("/add-comment/:taskId", (req, res) => handleAddComment(req, res));
Router.post("/validate-token", (req, res) => handleValidateToken(req, res));
Router.get("/fetch-all-task", (req, res) => handleFetchAllTask(req, res));
Router.post("/update-ticket", (req, res) => handleUpdateTicket(req, res));
Router.post("/upload-task", (req, res) => handleCreateNewTask(req, res));
Router.post("/edit-comment", (req, res) => handleEditComment(req, res));
Router.get("/all-users", (req, res) => handleFetchAllUsers(req, res));
Router.post("/register", (req, res) => handleRegister(req, res));
Router.post("/login", (req, res) => handleLogin(req, res));
export default Router;