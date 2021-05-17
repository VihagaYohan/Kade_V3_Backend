const { object, not } = require("joi");
const { Product } = require("../../models/Product");

let notAvailable = [];

// loop through product list (in a shop) & order items (in a order)
const updateStock = async (orderItems, shopId, task) => {
  // get all products availabel in shop
  const productList = await Product.find({ shopId: shopId });

  // loop through order items
  const orderItemList = await orderItems.map((item) =>
    checkForStockCount(item, productList, task)
  );

  if (notAvailable.length === 0) {
    return {
      sucess: true,
    };
  } else {
    return {
      sucess: false,
      notAvailable: notAvailable,
    };
  }
};

// check for product count and update product stock count accordingly
const checkForStockCount = async (item, productList, task) => {
  const productId = item.productId;
  const product = productList.find((p) => p._id.toString() === productId);

  let stockBalance = product.stockCount;
  let quantity = item.quantity;

  if (stockBalance === 0) {
    // checking whether item already exists in not available array
    if (notAvailable.length === 0) {
      return notAvailable.push(item);
    } else {
      const result = notAvailable.find((i) => i.productId === item.productId);
      if (result === null) {
        return notAvailable.push(item);
      } else {
        return;
      }
    }
  } else if (quantity > stockBalance) {
    return notAvailable.push(item);
  } else {
    stockBalance = stockBalance - quantity; // new stock balance

    // update new stock count for required product under given shop ID
    task = task.update(
      "products",
      {
        _id: productId,
      },
      {
        stockCount: {
          $subtract: ["$stockCount", quantity],
        },
      }
    );
    task.run();
    /* const obj = await Product.findByIdAndUpdate(
      productId,
      {
        stockCount: stockBalance,
      },
      { new: true }
    ); */ // find product
    //console.log(obj);
  }
};

module.exports = updateStock;
