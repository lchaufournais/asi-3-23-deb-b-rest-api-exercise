import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import hashPassword from "../hashPassword.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeUser } from "../sanitzers.js"
import {
  emailValidator,
  idValidator,
  nameValidator,
  passwordValidator,
  queryLimitValidator,
  queryOffsetValidator,
} from "../validators.js"

const makeRoutesUsers = ({ app, db }) => {
  const checkIfUserExists = async (userId) => {
    const user = await UserModel.query().findById(userId)

    if (user) {
      return user
    }

    throw new NotFoundError()
  }

  app.post(
    "/createUser",
    auth("admin"),
    validate({
      body: {
        email: emailValidator.required(),
        password: passwordValidator.required(),
        firstName: nameValidator.required(),
        lastName: nameValidator.required(),
        roleId: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { email, password, firstName, lastName, roleId },
        },
      } = req

      const user = await UserModel.query().findOne({ email })

      if (user) {
        res.send({ result: "ok" })

        return
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)
      await db("users").insert({
        email,
        firstName,
        lastName,
        roleId,
        passwordHash,
        passwordSalt,
      })

      res.send({ result: "ok" })
    })
  )

  app.get(
    "/users",
    auth("admin"),
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const users = await UserModel.query().limit(limit).offset(offset)

      res.send({ result: sanitizeUser(users) })
    })
  )

  app.get(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { userId },
        },
        session: { user: sessionUser },
      } = req

      if (userId !== sessionUser.id && sessionUser.role !== "admin") {
        throw new InvalidAccessError()
      }

      const user = await UserModel.query().findById(userId)

      if (!user) {
        return
      }

      res.send({ result: sanitizeUser(user) })
    })
  )

  app.patch(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
      body: {
        firstName: nameValidator,
        lastName: nameValidator,
        email: emailValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { firstName, lastName, email },
          params: { userId },
        },
        session: { user: sessionUser },
      } = req

      if (userId !== sessionUser.id && sessionUser.role !== "admin") {
        throw new InvalidAccessError()
      }

      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      const updatedUser = await UserModel.query().updateAndFetchById(userId, {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
      })

      res.send({ result: sanitizeUser(updatedUser) })
    })
  )
  app.delete(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        session: { user: sessionUser },
        data: {
          params: { userId },
        },
      } = req

      if (sessionUser.id === userId || sessionUser.role === "admin") {
        const user = await checkIfUserExists(userId, res)

        if (!user) {
          return
        }

        await UserModel.query().deleteById(userId)

        res.send({ result: sanitizeUser(user) })
      } else {
        throw new InvalidAccessError()
      }
    })
  )
}

export default makeRoutesUsers
