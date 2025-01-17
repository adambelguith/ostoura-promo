import { isAuth, hasRole } from '../../../middleware/jwt';
import { ACTIONS } from '../../../utils/permissions';
import checkPermission from '../../../middleware/checkPermission';

const handler = async (req, res) => {
  // Chain multiple middleware checks
  await isAuth(req, res, async () => {
    await hasRole(['admin', 'seller'])(req, res, async () => {
      await checkPermission(ACTIONS.VIEW_PRODUCTS)(req, res, async () => {
        // Your protected route logic here
        res.status(200).json({ 
          message: 'Protected resource accessed successfully',
          user: req.user
        });
      });
    });
  });
};

export default handler; 