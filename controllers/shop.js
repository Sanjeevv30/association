const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {

  req.user
  .getCart()
  .then(cart =>{
    return cart
    .getProducts()
    .then(products =>{
      res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products
            });
    })
    .catch(err => console.log(err))
  })
  .catch(err =>console.log(err))
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    // Get the user's cart
    const cart = await req.user.getCart();

    // Check if the product already exists in the cart
    const products = await cart.getProducts({ where: { id: prodId } });

    let product;
    if (products.length > 0) {
      product = products[0];
    }

    let newQuantity = 1;

    if (product) {
      // Handle existing product logic
      // ...
    }

    // Fetch the product to add to the cart
    const productToAdd = await Product.findByPk(prodId);

    // Add the product to the cart
    if (!cart) {
      // If the cart doesn't exist, create it
      const newCart = await req.user.createCart();
      await newCart.addProduct(productToAdd, {
        through: { quantity: newQuantity },
      });
    } else {
      // If the cart exists, use it
      await cart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    }

    res.redirect('/cart');
  } catch (err) {
    console.log(err);
    // Handle errors here
  }
};


exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    const product = await Product.findByPk(prodId);
    // Use req.user to get the cart and delete the product
    await req.user.getCart().then(cart => {
      return cart.removeProduct(product);
    });

    res.redirect('/cart');
  } catch (err) {
    console.log(err);
    // Handle errors here
  }
};


exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
