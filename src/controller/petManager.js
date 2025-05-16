import Pet from '../model/pet.Model.js';
import User from '../model/user.Model.js';


export const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find().populate('owner', 'first_name last_name email');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las mascotas', error });
  }
};


export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', 'first_name last_name email');
    if (!pet) return res.status(404).json({ message: 'Mascota no encontrada' });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar la mascota', error });
  }
};


export const createPet = async (req, res) => {
  try {
    const { name, type, owner } = req.body;

    
    const user = await User.findById(owner);
    if (!user) return res.status(404).json({ message: 'Dueño no encontrado' });

    const newPet = new Pet({ name, type, owner });
    await newPet.save();

   
    user.pets.push(newPet._id);
    await user.save();

    res.status(201).json({ message: 'Mascota creada', pet: newPet });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la mascota', error });
  }
};


export const updatePet = async (req, res) => {
  try {
    const { name, type } = req.body;
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { name, type },
      { new: true }
    );

    if (!pet) return res.status(404).json({ message: 'Mascota no encontrada' });
    res.json({ message: 'Mascota actualizada', pet });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la mascota', error });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Mascota no encontrada' });

    
    await User.findByIdAndUpdate(pet.owner, {
      $pull: { pets: pet._id }
    });

    res.json({ message: 'Mascota eliminada', pet });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la mascota', error });
  }
};

