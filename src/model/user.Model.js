import mongoose from "mongoose";
import { cartModel } from "../model/cart.model.js"; // Asegúrate de que cart.model.js no cree un ciclo con otros modelos.

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts", default: null },
  role: { type: String, default: 'user' },
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }]  // Aquí es donde 'User' depende de 'Pet'.
});

const User = mongoose.model('User', userSchema);

export default User;
