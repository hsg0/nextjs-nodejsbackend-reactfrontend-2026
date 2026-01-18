// nextjs-reactjs-practice-2026:backend/models/userDataModel.js
import { protect } from "../middleware/authMiddleware.js";
import express from "express";
import UserData from "../models/userDataModel.js";
import 
    { getUserData,
        saveUserData }
     from "../controllers/userDataController.js";

const userDataRouter = express.Router();

// Route to save user data
userDataRouter.post("/save-user-data", protect, saveUserData);

// retreive user data
userDataRouter.get("/get-user-data", protect, getUserData);

export default userDataRouter;




