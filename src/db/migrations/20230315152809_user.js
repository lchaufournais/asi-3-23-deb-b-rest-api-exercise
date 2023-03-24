export const up = async (knex) => {
  await knex.schema.createTable("roles", (table) => {
    table.increments("id")
    table.text("name")
  })

  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    table.text("email").notNullable().unique()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.text("firstName").notNullable()
    table.text("lastName").notNullable()
    table.integer("roleId").notNullable().references("id").inTable("roles")
  })

  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("url").unique().notNullable()
    table.integer("creatorId").notNullable().references("id").inTable("users")
    table.timestamp("created_at").defaultTo(knex.fn.now())
    table.text("status").notNullable()
  })

  await knex.schema.createTable("relationPageUser", (table) => {
    table.integer("idPage").notNullable().references("id").inTable("pages")
    table.integer("idUser").notNullable().references("id").inTable("users")
    table.timestamp("modified_at").defaultTo(knex.fn.now())
  })

  await knex.schema.createTable("navMenus", (table) => {
    table.increments("id")
    table.text("name").notNullable()
  })

  await knex.schema.createTable("relationNavPage", (table) => {
    table.integer("idPage").notNullable().references("id").inTable("pages")
    table.integer("navId").notNullable().references("id").inTable("navMenus")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("relationNavPage")
  await knex.schema.dropTable("relationPageUser")
  await knex.schema.dropTable("pages")
  await knex.schema.dropTable("users")
  await knex.schema.dropTable("navMenus")
  await knex.schema.dropTable("roles")
}
