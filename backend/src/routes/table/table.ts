import {Router} from 'express';
import  tableController  from '../../controllers/table.controller';
import { tenantLoader } from '../../middleware/tenantLoader/tenantLoader';

const tableRouter = Router();

tableRouter.post('/create', tenantLoader,tableController.createTable);
tableRouter.delete('/delete', tenantLoader,tableController.deleteTable);
tableRouter.post('/assign-group', tenantLoader,tableController.assignGroupToTable);

export default tableRouter;