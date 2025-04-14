//const menuModel = require('../models/menu-model');
const MenuCategory = require("../models/mongoose/menu-category-model-mongoose");
const MenuItem = require("../models/mongoose/menu-item-model-mongoose");



exports.getMenu = async (req, res, next) => {
  const { selectedCategory } = req.params;

  try {

    const menuData = await MenuCategory.find().populate('items');
    console.log("menuData is: ", menuData);
  
    // check if selected category is valid
    if (selectedCategory && !menuData.find((cat) => cat.slug === selectedCategory)) {
      return next();
    }
  
    res.render("menu", { title: "Menu", menuData, selectedCategory: selectedCategory || "breakfast" });
    
  } catch (error) {
    console.log(error);
    const err = new Error("Unable to retrieve menu data.  Please try again later.");
    next(err);
  }
 
}


// exports.getMenu = (req, res, next) => {
//   const { selectedCategory } = req.params;

//   let categories;
//   MenuCategory.findAll({ raw: true })
//     .then((data) => {
//       // console.log("categories are: ", data);
//       categories = data;
//       // check if selected category is valid
//       if (selectedCategory && !categories.find((cat) => cat.slug === selectedCategory)) {
//         return next();
//       }
//     })
//     .then(() => {
//       return MenuItem.findAll();
//     })
//     .then((items) => {
//       console.log("categories are: ", categories);
//       console.log("items are: ", items);
//       res.render("menu", { title: "Menu", categories: categories, items: items, selectedCategory: selectedCategory || "breakfast" });
//     })
//     .catch((err) => console.log(err));
// };


exports.getMenuItem = async (req, res, next) => {
  // const {id} = req.params;
  const { itemSlug } = req.params;

  try {
    const item = await MenuItem.findOne({slug: itemSlug}).populate('category');
    if (!item) {
      return next();
    }
      console.log("Menu item is: ", item);

      res.render("menu-item", { title: "Menu Item", item });
  
    
  } catch (error) {
    console.log(error);
    const err = new Error("Unable to retrieve menu item.  Please try again later.");
    next(err);

  }

 

}
// exports.getMenuItem = (req, res, next) => {
//   // const {id} = req.params;
//   const { itemSlug } = req.params;
//   //menuModel.fetchMenuItemById(id)
//   // MenuItem.findByPk(id, {

//   //     include: {
//   //         model: MenuCategory
//   //     }
//   // })
//   MenuItem.findOne(
//     {
//       where: { slug: itemSlug },
//       include: {
//         model: MenuCategory
//       }
//     }
//   )
//     .then((item) => {
//       console.log("Item is: ", item);
//       if (!item) {
//         next();
//       } else {
//         res.render("menu-item", { title: "Menu Item", item: item });
//       }
//     })
//     .catch((err) => console.log(err));
// };
