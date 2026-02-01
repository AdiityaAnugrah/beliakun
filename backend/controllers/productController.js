const { where } = require("sequelize");
const Product = require("../models/productModel.js");
const fs = require("fs");
const path = require("path");
const Category = require("../models/categoryModel.js");
const { Op } = require("sequelize");



const baseUrl = process.env.BASE_URL || "http://localhost:4000";
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
const addProduct = async (req, res) => {
    const { nama, harga, stock, link_shopee, status, produk_terjual, deskripsi, categoryId } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "Product image is required" });
    }

    if (!nama || !harga || !stock || !deskripsi || !categoryId) {
        return res.status(400).json({
            message: "Nama, harga, stok, deskripsi, dan kategori diperlukan",
        });
    }
    

    try {
        let baseSlug = slugify(nama);
        let slug = baseSlug;
        let count = 1;

        // Cek slug agar unik
        while (await Product.findOne({ where: { slug } })) {
            slug = `${baseSlug}-${count++}`;
        }

        const newProduct = await Product.create({
            nama,
            slug,
            harga,
            stock,
            gambar: req.file.filename,
            link_shopee,
            status,
            produk_terjual,
            deskripsi,
            categoryId,
        });

        res.status(200).json({
            message: "Product added successfully",
            product: newProduct,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error while adding product" });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        let product = await Product.findOne({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (req.file) {
            const imagePath = path.join(__dirname, "../uploads", product.gambar);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            product.gambar = req.file.filename;
        }

        const updatedProductData = { ...req.body, gambar: product.gambar };

        await Product.update(updatedProductData, { where: { id } });

        res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while updating product",
        });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const imagePath = path.join(__dirname, "../uploads", product.gambar);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        await product.destroy();

        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while deleting product",
        });
    }
};

const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({
            where: { slug },
            include: [{
                model: Category,
                as: "category",
                attributes: ["id", "label"],
            }],
        });

        if (!product) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        res.status(200).json({
            ...product.dataValues,
            gambar: `${baseUrl}/uploads/${product.gambar}`,
            kategori: product.category?.label,
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal ambil produk berdasarkan slug",
            error: error.message,
        });
    }
};

const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const kategori = req.query.kategori || null;
  const excludeId = parseInt(req.query.excludeId) || null;
  const id = req.params.id;

  const offset = (page - 1) * limit;
  const baseUrl = process.env.BASE_URL || "http://localhost:4000";

  try {
    // Get by ID langsung
    if (id) {
      const product = await Product.findByPk(id, {
        include: [{ model: Category, as: "category", attributes: ["id", "label"] }],
      });

      return res.status(200).json({
        ...product.dataValues,
        gambar: `${baseUrl}/uploads/${product.gambar}`,
      });
    }

    // Build where condition
    const whereCondition = {};

    // filter berdasarkan kategori label (bukan id)
    if (kategori) {
      const category = await Category.findOne({ where: { label: kategori } });
      if (category) {
        whereCondition.categoryId = category.id;
      } else {
        // kategori tidak ditemukan, return empty
        return res.status(200).json({
          products: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
        });
      }
    }

    if (excludeId) {
      whereCondition.id = { [Op.not]: excludeId };
    }

    const products = await Product.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "nama", "slug", "harga", "gambar", "produk_terjual", "stock", "categoryId", "status"],
      include: [{ model: Category, as: "category", attributes: ["id", "label"] }],
      limit,
      offset,
    });

    const productsWithFullImageUrl = products.rows.map((product) => ({
      ...product.dataValues,
      gambar: `${baseUrl}/uploads/${product.gambar}`,
      kategori: product.category?.label,
    }));

    const totalPages = Math.ceil(products.count / limit);

    res.status(200).json({
      products: productsWithFullImageUrl,
      totalItems: products.count,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};


const getProductLaris = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`; // Mendapatkan base URL server
        const products = await Product.findAll({
            attributes: ["id", "nama", "slug", "harga", "gambar", "produk_terjual", "categoryId"],
            order: [["produk_terjual", "DESC"]],
            limit: 4,
            include: [{ model: Category, as: "category", attributes: ["label"] }]
        });
        const productsWithFullImageUrl = products.map((product) => ({
            ...product.dataValues,
            gambar: `${baseUrl}/uploads/${product.gambar}`,
            kategori: product.category?.label,
        }));
        res.status(200).json(productsWithFullImageUrl);
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching products laris",
            error: error.message,
        });
    }
};



module.exports = { addProduct, getAllProducts, updateProduct, deleteProduct, getProductLaris, getProductBySlug };
