const axios = require('axios');
const jwt = require("jsonwebtoken");

let accessToken = null;

    // Create custom Axios instance
const recipeApi = axios.create({
    baseURL: 'https://dummyjson.com/auth',
    // headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   }
  });


function isExpired(token) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true; // treat invalid or missing exp as expired
    }
  
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

exports.recipeApiAuthenticate = async (req, res, next) => {

  if (!accessToken || isExpired(accessToken)) {
    try {
        const response = await axios.post("https://dummyjson.com/auth/login", {
          username: "michaelw",
          password: "michaelwpass",
          expiresInMins: 1
        });
        accessToken = response.data.accessToken;
        recipeApi.defaults.headers.Authorization = `Bearer ${accessToken}`;
       
        console.log("Access token set!", accessToken);
        
      } catch (error) {
        return next(error);
      }
  }

  next();
    
};

exports.getRecipes = async (req, res, next) => {
try {

    const { selectedMealType } = req.params;

    console.log("selected meal type is: ", selectedMealType);

    const response = await recipeApi.get('/recipes');
    // console.log("response is: ", response);

    recipes = response.data.recipes;
    // console.log("data is: ", response.data.recipes);

    // Get unique meal types
    // Step 1: Extract all mealTypes
    const allMealTypes = recipes.flatMap(recipe => recipe.mealType);

    // Step 2: Deduplicate using Set
    const uniqueMealTypes = [...new Set(allMealTypes)];

    console.log("unique meal types are: ", uniqueMealTypes);

    res.render("recipes", {mealTypes: uniqueMealTypes, recipes, selectedMealType: selectedMealType || "Dinner" })
    
} catch (error) {
    console.error("ERROR IS:  ", error);
    const customError = new Error("Error retreiving Recipe Data");
    customError.statusCode = error.status;
    next(customError);

}
    


}

exports.getRecipe = async (req, res, next) => {
    try {
    
        const { recipeId } = req.params;
    
        // console.log("selected meal type is: ", selectedMealType);
    
        const response = await recipeApi.get('/recipes/' + recipeId);
        // console.log("response is: ", response);
    
        const recipe = response.data;
        // console.log("data is: ", response.data.recipes);
    
 
    
        res.render("recipe-detail", {recipe})
        
    } catch (error) {
        console.error("ERROR IS:  ", error);
        const customError = new Error("Error retreiving Recipe Data");
        customError.statusCode = error.status;
        next(customError);
    
    }
        
    
    
    }