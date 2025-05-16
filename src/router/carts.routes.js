import { Router } from "express";
import { cartModel } from "../model/cart.model.js";
import { productModel } from "../model/product.model.js";
import { cartDao } from "../services/dao/carts.dao.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { purchaseCart } from "../controller/saleManager.js";
import mongoose from 'mongoose';




const router = Router();
/**
 * @swagger
 * /api/carts/{cid}/product/{pid}:
 *   post:
 *     summary: Agregar un producto al carrito
 *     description: Este endpoint agrega un producto al carrito especificado por su ID.
 *     parameters:
 *       - name: cid
 *         in: path
 *         description: ID del carrito
 *         required: true
 *         schema:
 *           type: string
 *       - name: pid
 *         in: path
 *         description: ID del producto
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto agregado correctamente al carrito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Producto producto123 agregado al carrito
 *       404:
 *         description: Carrito o producto no encontrado
 */

router.post("/", async (req, res) => {
  try {
    const cart = await cartModel.create({});

    res.json({ status: "ok", payload: cart });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});


router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartModel.findById(cid);
    if (!cart)
      return res.json({
        status: "error",
        message: `Carrito con ID ${cid} no encontrado`,
      });

    res.json({ status: "ok", payload: cart });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});


router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const findProduct = await productModel.findById(pid);
    if (!findProduct)
      return res.json({
        status: "error",
        message: `Producto con ID ${pid} no encontrado`,
      });

    const findCart = await cartModel.findById(cid);
    if (!findCart)
      return res.json({
        status: "error",
        message: `Carrito con Id ${cid} no encontrado`,
      });

    const product = findCart.products.find(
      (productCart) => productCart.product.toString() === pid 
    );
    if (!product) {
      
      const productId = new mongoose.Types.ObjectId(pid);
      findCart.products.push({ product: new mongoose.Types.ObjectId(pid), quantity: 1 });
      
      
    } else {
      
      product.quantity++;
    }

    await findCart.save(); 
    return res.json({
      status: "success",
      message: `Producto ${findProduct.title} agregado al carrito`,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: "error",
      message: "Error al agregar producto al carrito",
    });
  }
});


router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const updatedCart = await cartDao.deleteProductInCart(cid, pid);

    res.json({
      status: "success",
      message: `Product id ${pid} removed from cart id ${cid}`,
      data: updatedCart,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});


router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const { limit, page, sort, category, status } = req.query;

  try {
    const options = {
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
      sort: {
        price: sort === "asc" ? 1 : -1,
      },
      lean: true,
    };

    const cart = await cartDao.getById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({
          status: "error",
          message: `Carrito con id ${cid} no encontrado`,
        });
    }

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const paginatedProducts = await cartDao.pagAll(
      { ...filter, _id: cid },
      options
    );

    if (!paginatedProducts) {
      return res
        .status(404)
        .json({ status: "error", message: "No products found for this cart" });
    }

    const response = {
      status: "success",
      payload: paginatedProducts.docs,
      totalPages: paginatedProducts.totalPages,
      prevPage: paginatedProducts.prevPage,
      nextPage: paginatedProducts.nextPage,
      page: paginatedProducts.page,
      hasPrevPage: paginatedProducts.hasPrevPage,
      hasNextPage: paginatedProducts.hasNextPage,
      prevLink: paginatedProducts.hasPrevPage
        ? `/api/carts/${cid}?page=${paginatedProducts.prevPage}`
        : null,
      nextLink: paginatedProducts.hasNextPage
        ? `/api/carts/${cid}?page=${paginatedProducts.nextPage}`
        : null,
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", message: error.message });
  }
});


router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const updatedCart = await cartDao.deleteAllProductsInCart(cid);
    res.json({
      status: "success",
      message: `Todos los productos del carrito con Id ${cid}, fueron eliminados exitosamente`,
      data: updatedCart,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});


router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Quantity debe ser un número positivo",
      });
    }

    const updatedCart = await cartDao.updateProductQuantity(cid, pid, quantity);

    res.json({
      status: "success",
      message: `Cantidad de producto con id ${pid} en carrito id ${cid} fue actualizada.`,
      data: updatedCart,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});


router.get("/", async (req, res) => {
  try {

    const carts = await cartDao.getAll();
    const cartIds = carts.map((cart) => cart._id);

    res.json({
      status: "success",
      data: cartIds,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});



router.post("/:cid/purchase", authMiddleware, purchaseCart);

export default router;
