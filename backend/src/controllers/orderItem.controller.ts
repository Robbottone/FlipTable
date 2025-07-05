import { Response, Request } from 'express';
import { prisma } from '../../prisma/client';
import { TenantRequest } from 'src/types/typedRequest';
import { Order } from '@prisma/client';

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

        //l'array items presente in order, viene aggiornato quando associo all'orderItem l'orderId.
        //la gestione dell'array viene gestita in automatico grazie alla relazione
        // Order    @relation(fields: [orderId], references: [id])
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId,
            menuItemId,
            quantity: quantity ?? 1,
            notes: notes ?? '',
          }
        });

        const orderUpdated = await prisma.order.findUnique({
          where: {
            id: orderId
          }, include: {
            items: true
          }
        })

        if (!orderUpdated || orderUpdated.items.length == 0) {
          res.status(400).json({code: "0X", message: "ordine indicato non e' stato trovato dopo aggiornamento"})
        }

        if(orderUpdated!.items.some(el => el.id == orderItem.id)) {
            res.status(201)
               .json({ 
                      message: 'Order Item updated',
                      data: { orderItems: orderUpdated?.items }
                });
            
            return;
        }

        res.status(400).json({code: "0X", message: "Ordine non contiene il nuovo elemento"})
      
      } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Failed to update order" });
      }
    }
  }
}

export default orderItemController;