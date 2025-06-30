import { Response, Request} from 'express';
import { prisma } from '../../prisma/client';
import { TenantRequest } from 'src/types/typedRequest';

const orderItemController = {
    addOrderItem: async (req: Request, res: Response) => {
        
        const tenantReq = req as TenantRequest;
        const { orderId, menuItemId, quantity, notes } = req.body;

        if (!orderId || !menuItemId) {
            res.status(404).json({error: 'Order and MenuItem must exist in order to add an item'})
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                tenantId: tenantReq.tenant.id
            }, include: {
                items: true
            }
        })

        if (!order) {
            res.status(404).json({error: 'Order does not exists'})
            return;
        }

        //qui devo capire se esiste gia l'item e nel caso aggiungere la quantita richiesta a quella gia presente
        const indexItem = order.items.findIndex(i => i.menuItemId == menuItemId)
        
        if (indexItem != -1) {
            order.items[indexItem].quantity += (quantity ?? 1);

            if(notes) {
                order.items[indexItem].notes?.concat("-",notes)
            }

        } else {
            //qui devo aggiornare l'ordine direttamente
        }
    }
}