import { Router } from 'express';
import { tenantLoader } from '../../middleware/tenantLoader/tenantLoader';
import menuItemController from './../../controllers/menuItem.controller';

const menuItemRoute = Router();

menuItemRoute.get('/menu-item', tenantLoader, menuItemController.getMenuItem);
menuItemRoute.post('/menu-item', tenantLoader, menuItemController.createMenuItem);
menuItemRoute.delete('/menu-item/:id', tenantLoader, menuItemController.deleteMenuItem);
menuItemRoute.put('/menu-item/:id', tenantLoader, menuItemController.updateMenuItem);
menuItemRoute.put('/menu-item/visualization/:id', tenantLoader, menuItemController.updateMenuItemVisibility);

export default menuItemRoute;
