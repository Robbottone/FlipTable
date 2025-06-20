import { Router } from 'express';
import { tenantLoader } from '../../middleware/tenantLoader/tenantLoader';
import  menuController from '../../controllers/menu.controller'; 

const menuRoute = Router()

menuRoute.get('/menu', tenantLoader, menuController.getMenu);
menuRoute.get('/menu/:id', tenantLoader, menuController.getMenuById);
menuRoute.post('/menu', tenantLoader, menuController.createMenu);
menuRoute.post('/menu/:menuid/items', tenantLoader, menuController.addItemsToMenu);
menuRoute.delete('/menu/:menuId/items', tenantLoader, menuController.removeItemsFromMenu);
menuRoute.delete('/menu/:menuId', tenantLoader, menuController.deleteMenu);

export default menuRoute