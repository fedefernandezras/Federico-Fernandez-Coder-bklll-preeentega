import { getAllPets, getPetById, createPet, updatePet, deletePet} from '../controller/petManager.js';
import express from 'express';
const router = express.Router();

router.get('/', getAllPets);
router.get('/:id', getPetById);                
router.post('/', createPet);                   
router.put('/:id', updatePet);                 
router.delete('/:id', deletePet);  

export default router;