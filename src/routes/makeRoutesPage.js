import validate from "../middlewares/validate.js"
import {
  contentValidator,
  idValidator,
  statusValidator,
  titleValidator,
  urlValidator,
} from "../validators.js"
import mw from "../middlewares/mw.js"
import PageModel from "../db/models/PageModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"

const makeRoutesPages = ({ app, db }) => {
  const checkIfPageExists = async (pageId) => {
    const user = await PageModel.query().findById(pageId)

    if (user) {
      return user
    }

    throw new NotFoundError()
  }

  app.post(
    "/createPage",
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        url: urlValidator.required(),
        status: statusValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content, url, status },
        },
        session: { user: sessionUser },
      } = req

      if (sessionUser.role === "admin" || sessionUser.role === "manager") {
        const page = await PageModel.query().findOne({ url })

        if (page) {
          res.send({ result: "Already exist" })

          return
        }

        const creatorId = sessionUser.id

        await db("pages").insert({
          title,
          content,
          url,
          creatorId,
          status,
        })

        res.send({ result: "ok" })
      } else {
        throw new InvalidAccessError()
      }
    })
  )

  app.delete(
    "/pages/:pageId",
    validate({
      params: { pageId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        session: { user: sessionUser },
        data: {
          params: { pageId },
        },
      } = req

      if (sessionUser.role === "admin" || sessionUser.role === "manager") {
        const page = await checkIfPageExists(pageId, res)

        if (!page) {
          return
        }

        await PageModel.query().deleteById(pageId)

        res.send({ result: page })
      } else {
        throw new InvalidAccessError()
      }
    })
  )
}

export default makeRoutesPages
