import { Response, Request } from 'express';
import { prisma } from '../../prisma/client';
import { TenantRequest } from 'src/types/typedRequest';

const orderItemController = {
  addOrderItem: async (req: Request, res: Response) => {

    const tenantReq = req as TenantRequest;
    const { orderId, menuItemId, quantity, notes } = req.body;

    if (!orderId || !menuItemId) {
      res.status(404).json({ error: 'Order and MenuItem must exist in order to add an item' });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        tenantId: tenantReq.tenant.id
      }, include: {
        items: true
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order does not exists' });
      return;
    }

    // qui devo capire se esiste gia l'item e nel caso aggiungere 
    // la quantita richiesta a quella gia presente
    const indexItem = order.items.findIndex(i => i.menuItemId == menuItemId);

    if (indexItem != -1) {
      const orderItem = order.items[indexItem];

      orderItem.quantity += (quantity ?? 1);

      // non so se le note le vuoi come una lista che va a capo. Per quello ho messo il \n
      if (notes) {
        orderItem.notes = orderItem.notes
          ? orderItem.notes.concat("\n-", notes)
          : '-'.concat("\n-", notes);
      }
      res
          .status(201)
          .json({ 
            message: 'Order Item updated',
            data: { order, orderItem}
          });

    } else {
      try {
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId,
            menuItemId,
            quantity: quantity ?? 1,
            notes: notes ?? '',
          }
        });
        
        // TODO: come faccio ad aggiungere un item all order 
        // se nella tabella Order non ce un riferimento agli Items?
        
        // order.items.push(orderItem);

        // const updatedOrder = await prisma.order.update({
        //   where: {
        //     id: orderId
        //   },
        //   data: {
        //     item_id: orderItem.id
        //   }
        // })

        res
          .status(201)
          .json({ 
            message: 'Order Item updated',
            data: { order, orderItem}
          });
      } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Failed to update order" });
      }
    }
  }
}

export default orderItemController;