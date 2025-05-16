import { getPetsWithoutOwner, assignOwnerToPet, getAllAdoptions} from '../controller/adoptionManager.js';
import express from 'express';

const router = express.Router();

router.get('/', getPetsWithoutOwner);

router.put("/assign-owner", assignOwnerToPet);

router.get('/adoption-register', getAllAdoptions);                


export default router;