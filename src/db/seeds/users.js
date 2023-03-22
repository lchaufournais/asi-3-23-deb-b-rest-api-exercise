import { faker } from "@faker-js/faker"
import hashPassword from "../../hashPassword.js"

export const seed = async (knex) => {
  await knex("users").del()
  const users = []
  for (let i = 0; i < 10; i++) {
    const [passwordHash, passwordSalt] = await hashPassword("123abcABC")
    const user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
      roleId: faker.datatype.number({ min: 1, max: 3 }),
    }
    users.push(user)
  }

  return knex("users").insert(users)
}
