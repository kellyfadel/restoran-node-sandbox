const MenuCategory = require("../models/mongoose/menu-category-model-mongoose");
const MenuItem = require("../models/mongoose/menu-item-model-mongoose");
const jwt = require("jsonwebtoken");

// exports.getToken = (req, res, next) => {
//   const { user, passwordsMatch } = res.locals;

//   console.log("res.locals data is: ", user, passwordsMatch);

//   if (user && passwordsMatch) {
//     const token = jwt.sign(
//       {
//         email: user.email,
//         userId: user._id.toString(),
//       },
//       "somesupersecretsecret",
//       { expiresIn: "1h" }
//     );
//     return res
//       .status(200)
//       .json({ message: "Token Generated.", data: { token: token } });
//   }

//   // res.status(401).json({ message: "Authentication failed.", data: null });

//   let customError = new Error('Not authenticated.');
//   customError.statusCode = 401;
//   next(customError);
// };


//   const authHeader = req.get("Authorization");
//   if (!authHeader) {
//     // return res.status(401).json({ message: "Not Authenticated", data: null });
//     let customError = new Error('Not authenticated.');
//     customError.statusCode = 401;
//     return next(customError);
//   }
//   //  Bearer token
//   const token = authHeader.split(" ")[1];
//   let decodedToken;
//   try {
//     decodedToken = jwt.verify(token, "somesupersecretsecret");
//   } catch (err) {
//     console.log(err);
//     let customError = new Error('Server Error.');
//     customError.statusCode = 500;
//     return next(customError);
//     // return res.status(500).json({ message: "Server Error", data: null });
//     // err.statusCode = 500;
//     // throw err;
//   }
//   if (!decodedToken) {
//     // return res.status(401).json({ message: "Not Authenticated", data: null });
//     let customError = new Error('Token not valid.');
//     customError.statusCode = 401;
//     return next(customError);
//   }
//   req.userId = decodedToken.userId;
//   next();
// };

exports.getToken = (req, res, next) => {
  const { user, passwordsMatch } = res.locals;

  console.log("res.locals data is: ", user, passwordsMatch);

  if (!user || !passwordsMatch) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    return next(error);
  }

  const token = jwt.sign(
    { email: user.email, userId: user._id.toString() },
    "somesupersecretsecret",
    { expiresIn: "1h" }
  );

  res.status(200).json({
    message: "Token Generated.",
    data: { token },
  });
};

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, "somesupersecretsecret");

    if (!decodedToken) {
      const error = new Error("Token not valid.");
      error.statusCode = 401;
      throw error;
    }

    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    console.error(err);

    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = err.message || "Server Error.";
    }

    next(err);
  }
};

exports.getMenuData = async (req, res, next) => {
  try {
    const categories = await MenuCategory.find({}).populate("items").lean(); // Return a plain JavaScript object, not full mongoose model

    const sanitized = categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      items: cat.items.map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: "/img/menu/" + item.image,
      })),
    }));

    res.locals.data = sanitized;
    return next();
  } catch (err) {
    console.log(err);
    next(new Error("Failed to retrieve menu."));
  }
};

exports.getMenuDataByCategory = async (req, res, next) => {
  try {
    const category = await MenuCategory.findOne({ slug: req.params.category }).populate("items").lean();

    if (!category) throw new Error("Category not found.");

    const data = {
      name: category.name,
      slug: category.slug,
      items: category.items.map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: "/img/menu/" + item.image,
      })),
    };

    res.locals.data = data;
    return next();
  } catch (err) {
    next(new Error(`Failed to retrieve category: ${err.message}`));
  }
};

exports.getMenuItemData = async (req, res, next) => {
  try {
    const item = await MenuItem.findOne({ slug: req.params.item }).lean();

    if (!item) throw new Error("Menu item not found.");

    const data = {
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      image: item.image,
    };

    res.locals.data = data;
    return next();
  } catch (err) {
    next(new Error(`Failed to retrieve menu item: ${err.message}`));
  }
};

exports.sendResponse = (req, res) => {
  res.json({
    message: "Success!",
    data: res.locals.data,
  });
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  if (!err.statusCode)
    err.statusCode = 500;

  res.status(err.statusCode).json({
    message: `Error! ${err.message}`,
    data: null,
  });
};
