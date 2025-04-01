import { isAuth, hasPermission } from '../../../../middleware/jwt';
import db from '../../../../utils/db';
import { Permissions } from '../../../../utils/permissions';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Increase the payload limit to 50MB
    },
  },
};

const handler = async (req, res) => {
  try {
    // First check authentication
    const authResult = await isAuth(req, res);
    if (!authResult) {
      return; // Stop further execution if authentication fails
    }

    // Then check permissions
    const permissionResult = await hasPermission(Permissions.MANAGE_PRODUCTS)(req, res);
    if (!permissionResult) {
      return; // Stop further execution if permission check fails
    }

    // Handle the request based on the method
    if (req.method === 'GET') {
      return await getHandler(req, res);
    } else if (req.method === 'POST') {
      return await postHandler(req, res);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  try {
    const { page = 1, limit = 10, search, category, status, stock, sortBy } = req.query;

    // Build the query
    const where = {};
    if (search) {
      where.name_fr = { contains: search, mode: 'insensitive' };
    }
    if (category && category !== 'all') {
      where.categoryId = parseInt(category, 10);
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (stock && stock !== 'all') {
      if (stock === 'low') {
        where.quantity = { lt: 10 };
      } else if (stock === 'out') {
        where.quantity = { equals: 0 };
      }
    }

    // Build the orderBy
    const orderBy = {};
    if (sortBy === 'newest') {
      orderBy.created_at = 'desc';
    } else if (sortBy === 'oldest') {
      orderBy.created_at = 'asc';
    } else if (sortBy === 'price_high') {
      orderBy.price = 'desc';
    } else if (sortBy === 'price_low') {
      orderBy.price = 'asc';
    } else if (sortBy === 'stock_low') {
      orderBy.quantity = 'asc';
    }

    // Fetch products with pagination (exclude description)
    const products = await db.mysql.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: parseInt(limit, 10),
      select: {
        id: true,
        name_fr: true,
        name_ar: true,
        name_url: true,
        price: true,
        quantity: true,
        status: true,
        created_at: true,
        images: true, // Include images to extract the first one
        category: {
          select: {
            name_fr: true,
          },
        },
      },
    });

    // Transform products to include only the first image
    const transformedProducts = products.map(product => {
      let firstImage = null;
      if (product.images) {
        // Check if images is already a string (JSON) or an array
        const imagesArray = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        firstImage = imagesArray[0]; // Extract the first image
      }
      return {
        ...product,
        image: firstImage, // Add the first image to the product
        images: undefined, // Remove the full images array
      };
    });

    // Count total products for pagination
    const totalCount = await db.mysql.product.count({ where });

    return res.status(200).json({
      products: transformedProducts,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Error fetching products' });
  } finally {
    await db.disconnect();
  }
};

const postHandler = async (req, res) => {
  await db.connect();
  try {
    const {
      name_fr,
      name_ar,
      name_url,
      description,
      images,
      categoryId,
      price,
      quantity,
      quantity_endommage,
      quantity_notification,
      sellerId,
      variants,
      remise_prodique,
      remise_gros,
    } = req.body;

    // Validate required fields
    if (
      !name_fr ||
      !name_ar ||
      !name_url ||
      !categoryId ||
      !price ||
      !quantity ||
      !sellerId
    ) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields: {
          name_fr: !name_fr,
          name_ar: !name_ar,
          name_url: !name_url,
          categoryId: !categoryId,
          price: !price,
          quantity: !quantity,
          sellerId: !sellerId,
        },
      });
    }

    // Determine status based on user role
    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    // Create the product
    const product = await db.mysql.product.create({
      data: {
        name_fr,
        name_ar,
        name_url,
        description,
        images: images || [],
        categoryId,
        price,
        quantity,
        quantity_endommage: quantity_endommage || 0,
        quantity_notification: quantity_notification || 0,
        sellerId,
        status: status, // Default status
        variants: variants ? JSON.stringify(variants) : null,
        remise_prodique: remise_prodique ? JSON.stringify(remise_prodique) : null,
        remise_gros: remise_gros ? JSON.stringify(remise_gros) : null,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Error creating product' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
