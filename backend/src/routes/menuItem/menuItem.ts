import { Router } from 'express';
import { tenantLoader } from '../../middleware/tenantLoader/tenantLoader';
import { createMenuItem, deleteMenuItem,  updateMenuItem, updateMenuItemVisibility } from './../../controllers/menuItem.controller';

const menuItemRoute = Router();

menuItemRoute.post('/menu-item', tenantLoader, createMenuItem);

menuItemRoute.put('/menu-item/:id', tenantLoader, updateMenuItem);

menuItemRoute.put('/menu-item/visualization/:id', tenantLoader, updateMenuItemVisibility);

menuItemRoute.delete('/menu-item/:id', tenantLoader, deleteMenuItem);

export default menuItemRoute;
