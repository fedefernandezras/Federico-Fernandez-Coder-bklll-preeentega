import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adoptionDate: {
    type: Date,
    required: true,
  },
});

const Adoption = mongoose.model("Adoption", adoptionSchema);

export default Adoption;
