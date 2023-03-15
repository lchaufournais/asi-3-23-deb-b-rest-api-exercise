import BaseModel from "./BaseModel"
import UserModel from "./UserModel"

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
    }
  }
}

export default PageModel
