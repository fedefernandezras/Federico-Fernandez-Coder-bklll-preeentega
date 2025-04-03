import express from "express";
import productsRoutes from "./router/products.routes.js";
import cartsRoutes from "./router/carts.routes.js";
import userRoutes from './router/user.Routes.js';
import { connectMongoDB } from "./config/mongoDb.config.js";
import cookieParser from 'cookie-parser';
import passport from './config/passport-config.js';
import mongoose from 'mongoose';
import { config } from "dotenv";
import mocksRouter from "./router/mocks.routes.js";

config();
connectMongoDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());

app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);
app.use("/api/sessions", userRoutes);
app.use("/api/mocks", mocksRouter);

const PORT = process.env.PORT || 8080;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error(err));