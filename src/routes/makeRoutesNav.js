import validate from "../middlewares/validate.js"
import mw from "../middlewares/mw.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import {
  idValidator,
  nameNavValidator,
  nameValidator,
  queryLimitValidator,
  queryOffsetValidator,
} from "../validators.js"
import NavigationModel from "../db/models/NavigationModel.js"

const makeRoutesNav = ({ app, db }) => {
  const checkIfNavExists = async (navId) => {
    const nav = await NavigationModel.query().findById(navId)

    if (nav) {
      return nav
    }

    throw new NotFoundError()
  }

  app.post(
    "/createNav",
    validate({
      body: {
        name: nameNavValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { name },
        },
        session: { user: sessionUser },
      } = req

      if (sessionUser.role === "admin" || sessionUser.role === "manager") {
        await db("navMenus").insert({
          name,
        })
        res.send({ result: "ok" })
      } else {
        throw new InvalidAccessError()
      }
    })
  )

  app.delete(
    "/navs/:navId",
    validate({
      params: { navId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        session: { user: sessionUser },
        data: {
          params: { navId },
        },
      } = req

      if (sessionUser.role === "admin" || sessionUser.role === "manager") {
        const nav = await checkIfNavExists(navId, res)

        if (!nav) {
          return
        }

        await NavigationModel.query().deleteById(navId)

        res.send({ result: nav })
      } else {
        throw new InvalidAccessError()
      }
    })
  )

  app.get(
    "/navs",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const navs = await NavigationModel.query().limit(limit).offset(offset)

      res.send({ result: navs })
    })
  )

  app.get(
    "/navs/:navId",
    validate({
      params: { navId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { navId },
        },
      } = req

      const nav = await NavigationModel.query().findById(navId)

      res.send({ result: nav })
    })
  )

  app.patch(
    "/navs/:navId",
    validate({
      params: { navId: idValidator.required() },
      body: {
        name: nameValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { name },
          params: { navId },
        },
        session: { user: sessionUser },
      } = req

      if (sessionUser.role !== "admin" && sessionUser.role !== "manager") {
        throw new InvalidAccessError()
      }

      const nav = await checkIfNavExists(navId)

      if (!nav) {
        return
      }

      const updatedNav = await NavigationModel.query().updateAndFetchById(
        navId,
        {
          ...(name ? { name } : {}),
        }
      )

      res.send({ result: updatedNav })
    })
  )
}
export default makeRoutesNav
