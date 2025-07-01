import { Router } from 'express';
import { tenantLoader } from '../../middleware/tenantLoader/tenantLoader';
import  orderItemController from '../../controllers/orderItem.controller'; 

const orderItemRoute = Router();

orderItemRoute.post('/add-order-item', tenantLoader, orderItemController.addOrderItem);

export default orderItemRoute;