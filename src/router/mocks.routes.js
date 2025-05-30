import { Router } from "express";
import { generateMockUsers } from "../mocks/mocking.js";
import { generateMockPets } from "../mocks/adoptionmocks.js";
import UserModel from "../model/user.Model.js";
import PetModel from "../model/pet.Model.js";
import { faker } from "@faker-js/faker";

const router = Router();


router.get("/mockingusers", (req, res) => {
    const users = generateMockUsers(50);
    res.json(users);
});

router.post("/generateMockPets", async (req, res) => {
    const { pets } = req.body;

    if (!pets || typeof pets !== "number" || pets <= 0) {
        return res.status(400).json({ error: "Debes enviar una cantidad válida de mascotas." });
    }

    try {
        const mockPets = generateMockPets(pets);
        const insertedPets = await PetModel.insertMany(mockPets);

        res.json({
            message: "Mascotas sin dueño generadas correctamente",
            pets: insertedPets.length,
        });
    } catch (error) {
        console.error("Error al generar mascotas sin dueño:", error);
        res.status(500).json({ error: error.message });
    }
});
router.post("/generateData", async (req, res) => {
    const { users, pets } = req.body;
    try {
      
        const mockUsers = generateMockUsers(users);
        const insertedUsers = await UserModel.insertMany(mockUsers);

        
        const mockPets = Array.from({ length: pets }, () => ({
            name: faker.animal.dog(),
            type: faker.helpers.arrayElement(["dog", "cat", "bird"]),
            owner: faker.helpers.arrayElement(insertedUsers)._id, 
        }));

        await PetModel.insertMany(mockPets);

        res.json({ message: "Datos generados e insertados correctamente", users: insertedUsers.length, pets: mockPets.length });
    } catch (error) {
        console.error(" Error en generateData:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/usersypets", async (req, res) => {
    try {
        
        const usersWithPets = await UserModel.find()
            .populate({
                path: "cart", 
                select: "-__v" 
            })
            .lean(); 

       
        const pets = await PetModel.find().lean();

     
        const result = usersWithPets.map(user => ({
            user,
            pets: pets.filter(pet => pet.owner?.toString() === user._id.toString()) 
        }));

        res.json(result);
    } catch (error) {
        console.error("Error al obtener usuarios y mascotas:", error);
        res.status(500).json({ error: "Error al obtener usuarios y mascotas" });
    }
});
export default router;
