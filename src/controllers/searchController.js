import { prisma } from "../config/prisma.js";

// Búsqueda global de productos
export const searchProducts = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      minPrice, 
      maxPrice, 
      inStock = true,
      page = 1, 
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const where = {
      active: true
    };

    // Búsqueda por texto
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Filtro por categoría
    if (category) {
      where.category = category;
    }

    // Filtro por rango de precios
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Filtro por stock
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Validar sortBy
    const validSortFields = ['name', 'price', 'createdAt', 'stock'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder === 'desc' ? 'desc' : 'asc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortField]: sortDirection }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        query: q,
        category,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        inStock: inStock === 'true'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en la búsqueda de productos" });
  }
};

// Búsqueda de productos populares
export const getPopularProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularProducts = await prisma.product.findMany({
      where: { 
        active: true,
        stock: { gt: 0 }
      },
      take: parseInt(limit),
      orderBy: [
        { stock: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ products: popularProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos populares" });
  }
};

// Búsqueda de productos relacionados
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: { category: true }
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: parseInt(id) },
        active: true,
        stock: { gt: 0 },
        category: product.category
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({ products: relatedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos relacionados" });
  }
};

// Búsqueda de sugerencias
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const [productNames, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
          active: true
        },
        select: { name: true },
        take: 5
      }),
      prisma.product.findMany({
        where: {
          category: { contains: q, mode: 'insensitive' },
          active: true
        },
        select: { category: true },
        distinct: ['category'],
        take: 3
      })
    ]);

    const suggestions = [
      ...productNames.map(p => ({ type: 'product', value: p.name })),
      ...categories.map(c => ({ type: 'category', value: c.category }))
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener sugerencias" });
  }
};

