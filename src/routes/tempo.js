import validate from "../middlewares/validate.js"
import {
  contentValidator,
  idValidator,
  queryLimitValidator,
  queryOffsetValidator,
  statusValidator,
  titleValidator,
  urlValidator,
} from "../validators.js"
import mw from "../middlewares/mw.js"
import PageModel from "../db/models/PageModel.js"
import {
  InvalidAccessError,
  InvalidSessionError,
  NotFoundError,
} from "../errors.js"
import NavigationModel from "../db/models/NavigationModel.js"

const makeRoutesPages = ({ app, db }) => {
  const checkIfPageExists = async (url) => {
    const page = await PageModel.query().findOne({ url })

    if (page) {
      return page
    }

    throw new NotFoundError()
  }

  const checkIfNavExists = async (idNav) => {
    const nav = await NavigationModel.query().findById(idNav)

    if (nav) {
      return nav
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
        idNav: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content, url, status, idNav },
        },
        session: { user: sessionUser },
      } = req

      if (sessionUser.role === "admin" || sessionUser.role === "manager") {
        const nav = checkIfNavExists(idNav)
        const page = await PageModel.query().where({ url: url })

        if (!nav) {
          res.send({ result: "Nav not found" })
        }

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

        const tempo = await PageModel.query()
          .select("pages.id")
          .where({ url: url })

        const idPage = tempo.id

        await db("relationNavPage").insert({
          idNav,
          idPage,
        })

        res.send({ result: "ok" })
      } else {
        throw new InvalidAccessError()
      }
    })
  )

  app.delete(
    "/pages/:url",
    validate({
      params: { pageId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        session: { user: sessionUser },
        data: {
          params: { url },
        },
      } = req

      if (sessionUser.role === "admin" || sessionUser.role === "manager") {
        const page = await checkIfPageExists(url)

        if (!page) {
          return
        }

        await PageModel.query().where({ url: url }).delete()

        res.send({ result: page })
      } else {
        throw new InvalidAccessError()
      }
    })
  )

  app.get(
    "/pages",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const {
        session: { user: sessionUser },
      } = req

      let pages
      const query = PageModel.query().limit(limit).offset(offset)

      if (sessionUser !== null) {
        pages = await query
      } else {
        pages = await query.where({ status: "published" })
      }

      if (!pages) {
        throw new NotFoundError()
      }

      res.send({ result: pages })
    })
  )

  app.get(
    "/pages/:url",
    validate({
      params: { url: urlValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { url },
        },
        session: { user: sessionUser },
      } = req

      const page = await PageModel.query().findOne({ url })

      if (page.status !== "published" && sessionUser === null) {
        throw new InvalidAccessError()
      }

      res.send({ result: page })
    })
  )

  app.patch(
    "/pages/:url",
    validate({
      params: { url: urlValidator.required() },
      body: {
        title: titleValidator,
        content: contentValidator,
        status: statusValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content, status },
          params: { url },
        },
        session: { user: sessionUser },
      } = req

      if (sessionUser !== null) {
        const pageExist = await checkIfPageExists(url)

        if (!pageExist) {
          return
        }

        const page = await PageModel.query().findOne({ url })
        const updatedPage = await page.$query().updateAndFetch({
          ...(title ? { title } : {}),
          ...(content ? { content } : {}),
          ...(status ? { status } : {}),
        })

        const idUser = sessionUser.id
        const idPage = page.id

        const relationPage = await db("relationPageUser").insert({
          idPage,
          idUser,
        })
        res.send({ result: updatedPage, relationPage })
      } else {
        throw new InvalidSessionError()
      }
    })
  )
}

export default makeRoutesPages
