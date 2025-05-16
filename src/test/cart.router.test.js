import mongoose from 'mongoose';
import assert from 'node:assert';
import { connectMongoDB } from '../config/mongoDb.config.js';
import { cartDao } from '../services/dao/carts.dao.js';
import { productDao } from '../services/dao/products.dao.js';

const testProduct = {
  title: 'Producto test',
  price: 999,
  description: 'Test',
};

describe('CartDao', function () {
  this.timeout(10000);
  let product, cart;

  before(async function () {
    await connectMongoDB();
    product = await productDao.create(testProduct);
  });

  afterEach(async function () {
    const collections = mongoose.connection.collections;
    if (collections.carts) await collections.carts.drop().catch(() => {});
  });

  after(async function () {
    if (mongoose.connection.collections.products) {
      await mongoose.connection.collections.products.drop().catch(() => {});
    }
    await mongoose.connection.close();
  });

  it('debe crear un carrito', async function () {
    cart = await cartDao.create({ products: [] });
    assert.ok(cart._id);
    assert.deepStrictEqual(cart.products.length, 0);
  });

  it('debe agregar un producto al carrito y actualizar cantidad', async function () {
    cart = await cartDao.create({ products: [{ product: product._id, quantity: 1 }] });
    const updated = await cartDao.updateProductQuantity(cart._id, product._id, 5);

    const prod = updated.products.find(p => p.product._id.toString() === product._id.toString());
    assert.ok(prod);
    assert.strictEqual(prod.quantity, 5);
  });

  it('debe eliminar un producto del carrito', async function () {
    cart = await cartDao.create({ products: [{ product: product._id, quantity: 1 }] });
    const updated = await cartDao.deleteProductInCart(cart._id, product._id.toString());

    assert.strictEqual(updated.products.length, 0);
  });

  it('debe vaciar todos los productos del carrito', async function () {
    cart = await cartDao.create({
      products: [
        { product: product._id, quantity: 1 },
        { product: product._id, quantity: 2 }
      ]
    });

    const cleared = await cartDao.deleteAllProductsInCart(cart._id);
    assert.deepStrictEqual(cleared.products.length, 0);
  });

  it('debe actualizar el arreglo completo de productos', async function () {
    cart = await cartDao.create({ products: [] });
    const updated = await cartDao.updateCartProducts(cart._id, [
      { product: product._id, quantity: 3 }
    ]);

    assert.strictEqual(updated.products.length, 1);
    assert.strictEqual(updated.products[0].quantity, 3);
  });

  it('debe eliminar el carrito', async function () {
    cart = await cartDao.create({ products: [] });
    const deleted = await cartDao.delete(cart._id);

    assert.strictEqual(deleted._id.toString(), cart._id.toString());
  });
});
