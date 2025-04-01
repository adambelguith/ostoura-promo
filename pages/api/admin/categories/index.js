import db from '../../../../utils/db';
import { isAuth, hasPermission } from '../../../../middleware/jwt';
import { Permissions } from '../../../../utils/permissions';
const handler = async (req, res) => {

  const authResult = await isAuth(req, res);
  if (!authResult) {
    return; // Stop further execution if authentication fails
  }

  // Then check permissions
  const permissionResult = await hasPermission(Permissions.MANAGE_CATEGORIES)(req, res);
  if (!permissionResult) {
    return; // Stop further execution if permission check fails
  }

    if (req.method === 'GET') {
      return getHandler(req, res);
    } else if (req.method === 'POST') {
      return postHandler(req, res);
    } else {
      return res.status(400).send({ message: 'Method Not Allowed' });
    }
  
};

const postHandler = async (req, res) => {
  await hasPermission(Permissions.MANAGE_CATEGORIES)(req, res, () => {});
  await db.connect();
  const { name_fr, name_ar, description_fr, description_ar, status, sellerId, id_fathercategory } = req.body;

  // Generate a URL-friendly version of name_fr
  const name_url = name_fr
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end

  try {
    const newCategory = await db.mysql.category.create({
      data: {
        name_fr,
        name_ar,
        description_fr,
        description_ar,
        name_url, // Include the generated name_url
        status,
        sellerId,
        id_fathercategory: id_fathercategory ? Number(id_fathercategory) : null,
      },
    });

    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    await db.disconnect();
    res.status(500).send({ message: 'Failed to create category', error: error.message });
  } finally {
    await db.disconnect();
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  try {
    const categories = await db.mysql.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  } finally {
    await db.disconnect();
  }
};



export default handler;