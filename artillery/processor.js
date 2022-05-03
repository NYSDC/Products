const randomProductId = (requestParams, context, ee, next) => {
  context.vars.productId = Math.floor(Math.random() * 1000011);
  return next();
};

const randomProductPage = (requestParams, context, ee, next) => {
  context.vars.productPage = Math.floor(Math.random() * 1000);
  return next();
};

const randomProductCount = (requestParams, context, ee, next) => {
  context.vars.productCount = Math.floor(Math.random() * 1000);
  return next();
};

const randomUserSession = (requestParams, context, ee, next) => {
  context.vars.userSession = 1000 + Math.floor(Math.random() * 9000);
  return next();
};

module.exports = {
  randomProductId,
  randomProductPage,
  randomProductCount,
  randomUserSession
};