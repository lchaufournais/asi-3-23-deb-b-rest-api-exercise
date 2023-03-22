import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"

class RoleModel extends BaseModel {
  static tableName = "roles"

  static get relationMappings() {
    return {
      users: {
        modelClass: UserModel,
        relation: BaseModel.HasManyRelation,
        join: {
          from: "roles.id",
          to: "users.roleId",
        },
      },
    }
  }
}

export default RoleModel
