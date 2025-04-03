import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";


const hashPassword = (password) => bcrypt.hashSync(password, 10);


export const generateMockUser = () => ({
    _id: faker.database.mongodbObjectId(),
    first_name: faker.person.firstName(),  
    last_name: faker.person.lastName(),    
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }), 
    password: hashPassword("coder123"),
    role: faker.helpers.arrayElement(["user", "admin"]),
    pets: [],
});


export const generateMockUsers = (count = 50) => Array.from({ length: count }, generateMockUser);
