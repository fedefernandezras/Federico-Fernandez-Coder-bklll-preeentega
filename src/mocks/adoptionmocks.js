import { faker } from "@faker-js/faker";


const generateMockPet = () => ({
  name: faker.animal.dog(), 
  type: faker.helpers.arrayElement(["dog", "cat", "bird"]),
  owner: null, 
});


export const generateMockPets = (count = 10) => Array.from({ length: count }, generateMockPet);
