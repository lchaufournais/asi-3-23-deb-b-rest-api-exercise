import BaseModel from "./BaseModel.js"
import PageModel from "./PageModel.js"

class NavigationModel extends BaseModel {
  static get tableName() {
    return "navMenus"
  }

  static get relationMappings() {
    return {
      pages: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: PageModel,
        join: {
          from: "navMenus.id",
          through: {
            from: "relationNavPage.navId",
            to: "relationNavPage.idPage",
          },
          to: "pages.id",
        },
      },
    }
  }
}

export default NavigationModel
