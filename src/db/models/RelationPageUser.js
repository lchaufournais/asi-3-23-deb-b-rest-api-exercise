import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"
import PageModel from "./PageModel.js"

class RelationPageUser extends BaseModel {
  static tableName = "relationPageUser"

  static get relationMappings() {
    return {
      RelationUser: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "users.id",
          through: {
            from: "relationPageUser.idPage",
            to: "relationPageUser.idUser",
          },
          to: "users.id",
        },
      },
      RelationPage: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: PageModel,
        join: {
          from: "pages.id",
          through: {
            from: "relationPageUser.idUser",
            to: "relationPageUser.idPage",
          },
          to: "pages.id",
        },
      },
    }
  }
}

export default RelationPageUser
