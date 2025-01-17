import db from '../../../../utils/db';

const handler = async (req, res) => {

  await db.connect();
  const order = await db.order.order.findUnique({
    where: { id: parseInt(req.query.id) },
  });
  if (order) {
    if (order.isPaid) {
      return res.status(400).send({ message: 'Error: order is already paid' });
    }
    const updatedOrder = await db.order.order.update({
      where: { id: parseInt(req.query.id) },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult: {
          id: req.body.id,
          status: req.body.status,
          email_address: req.body.email_address,
        },
      },
    });
    await db.disconnect();
    res.send({ message: 'order paid successfully', order: updatedOrder });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Error: order not found' });
  }
};

export default handler;
