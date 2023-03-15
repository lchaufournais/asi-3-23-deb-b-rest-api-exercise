import BaseModel from "./BaseModel"
import UserModel from "./UserModel"

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
