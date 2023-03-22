import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"

const mw = (handle) => async (req, res, next) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      req.session = { user: null }
    } else {
      const { payload } = jsonwebtoken.verify(
        authorization.slice(7),
        config.security.session.jwt.secret
      )
      req.session = payload
    }

    await handle(req, res, next)
  } catch (err) {
    next(err)
  }
}

export default mw
