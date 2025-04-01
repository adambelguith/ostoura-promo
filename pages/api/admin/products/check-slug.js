import db from '../../../../utils/db';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }

  await db.connect();
  try {
    const product = await db.mysql.product.findFirst({
      where: {
        name_url: slug,
      },
    });

    res.status(200).json({ exists: !!product });
  } catch (error) {
    console.error('Error checking slug:', error);
    res.status(500).json({ message: 'Error checking slug' });
  } finally {
    await db.disconnect();
  }
} 