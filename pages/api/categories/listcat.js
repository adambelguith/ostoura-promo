import db from '../../../utils/db';

const getHandler = async (req, res) => {
  await db.connect();
  try {
    // Get all categories
    const allCategories = await db.mysql.category.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    // Function to calculate category depth/level
    const calculateCategoryLevel = (categoryId, categoriesMap = new Map()) => {
      // If we've already calculated this category's level, return it
      if (categoriesMap.has(categoryId)) {
        return categoriesMap.get(categoryId);
      }

      const category = allCategories.find(cat => cat.id === categoryId);
      if (!category) return 0;

      // If it's a root category (no father)
      if (!category.id_fathercategory) {
        categoriesMap.set(categoryId, 1);
        return 1;
      }

      // Calculate parent's level first
      const parentLevel = calculateCategoryLevel(category.id_fathercategory, categoriesMap);
      const currentLevel = parentLevel + 1;
      
      // Store the result in the map
      categoriesMap.set(categoryId, currentLevel);
      return currentLevel;
    };

    // Process all categories and add their levels
    const categoriesMap = new Map();
    const processedCategories = allCategories.map(category => {
      const level = calculateCategoryLevel(category.id, categoriesMap);
      return {
        ...category,
        level,
        hasChildren: allCategories.some(cat => cat.id_fathercategory === category.id)
      };
    });

    res.send({
      categories: processedCategories,
      metadata: {
        maxLevel: Math.max(...processedCategories.map(cat => cat.level)),
        totalCategories: processedCategories.length,
        categoriesPerLevel: processedCategories.reduce((acc, cat) => {
          acc[cat.level] = (acc[cat.level] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  } finally {
    await db.disconnect();
  }
};

export default getHandler;