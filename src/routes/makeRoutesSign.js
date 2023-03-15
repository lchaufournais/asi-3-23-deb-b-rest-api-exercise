import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import { InvalidCredentialsError } from "../errors.js"
import hashPassword from "../hashPassword.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { emailValidator } from "../validators.js"

const makeRoutesSign = ({ app, db }) => {
  app.post(
    "/sign-in",
    validate({
      body: {
        email: emailValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { email, password } = req.data.body
      const [user] = await db("users").where({ email })

      if (!user) {
        throw new InvalidCredentialsError()
      }

      const [passwordHash] = hashPassword(password, user.passwordSalt)

      if (user.passwordHash !== passwordHash) {
        throw new InvalidCredentialsError()
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
              fullName: `${user.firstName} ${user.lastName}`,
            },
          },
        },
        config.security.session.jwt.secret,
        { expiresIn: config.security.session.jwt.expiresIn }
      )

      res.send({ result: jwt })
    })
  )
}

export default makeRoutesSign
