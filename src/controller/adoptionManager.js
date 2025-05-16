import Pet from "../model/pet.Model.js"; 
import User from "../model/user.Model.js";
import Adoption from "../model/adoption.Model.js";

export const getPetsWithoutOwner = async (req, res) => {
  try {
  
    const petsWithoutOwner = await Pet.find({ owner: null });
    
    if (petsWithoutOwner.length === 0) {
      return res.status(404).json({ message: "No hay mascotas sin dueño" });
    }


    res.json(petsWithoutOwner);
  } catch (error) {
    console.error("Error al obtener las mascotas sin dueño:", error);
    res.status(500).json({ message: "Error al obtener las mascotas sin dueño", error });
  }
};

export const assignOwnerToPet = async (req, res) => {
  const { petId, userId } = req.body;

  try {
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    
    if (pet.owner !== null) {
      return res.status(400).json({ message: "La mascota ya tiene dueño" });
    }

 
    pet.owner = userId;
    await pet.save();

   
    user.pets.push(petId);
    await user.save();

  
    const newAdoption = new Adoption({
      pet: petId,
      user: userId,
      adoptionDate: new Date(), 
    });

   
    await newAdoption.save();

    res.json({ message: "Mascota adoptada correctamente", pet });
  } catch (error) {
    console.error("Error al asignar dueño a la mascota:", error);
    res.status(500).json({ message: "Error al asignar dueño a la mascota", error });
  }
};

export const getAllAdoptions = async (req, res) => {
  try {

    const adoptions = await Adoption.find()
      .populate("pet", "name type") 
      .populate("user", "first_name last_name email"); 

    if (adoptions.length === 0) {
      return res.status(404).json({ message: "No hay adopciones registradas" });
    }

    res.json(adoptions);  
  } catch (error) {
    console.error("Error al obtener las adopciones:", error);
    res.status(500).json({ message: "Error al obtener las adopciones", error });
  }
};