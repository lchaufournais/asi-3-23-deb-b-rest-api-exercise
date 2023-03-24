import BaseModel from "./BaseModel.js"
import NavigationModel from "./NavigationModel.js"
import UserModel from "./UserModel.js"

class PageModel extends BaseModel {
  static tableName = "pages"

  static get relationMappings() {
    return {
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "pages.creatorId",
          to: "users.id",
        },
      },
      relationPageUser: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: UserModel,
        join: {
          from: "pages.id",
          through: {
            from: "relationPageUser.idPage",
            to: "relationPageUser.idUser",
          },
          to: "users.id",
        },
      },
      relationNavPage: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: NavigationModel,
        join: {
          from: "pages.id",
          through: {
            from: "relationNavPage.idPage",
            to: "relationNavPage.idNav",
          },
          to: "navMenus.id",
        },
      },
    }
  }
}

export default PageModel
