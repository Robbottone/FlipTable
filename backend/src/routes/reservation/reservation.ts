import { Router } from 'express';
import { tenantLoader } from 'src/middleware/tenantLoader/tenantLoader';
import reservationController from 'src/controllers/reservation.controller';

const reservationRouter = Router();

reservationRouter.get('/', tenantLoader, reservationController.getAllReservation);
reservationRouter.get('/by-phone', tenantLoader, reservationController.getReservationByPhoneNumber);
reservationRouter.get('/by-email', tenantLoader, reservationController.getReservationByEmail);
reservationRouter.post('/', tenantLoader, reservationController.createReservation);
reservationRouter.put('/:id', tenantLoader, reservationController.setTableToReservation);
reservationRouter.put('/:id', tenantLoader, reservationController.updateReservationStatus);
reservationRouter.delete('/:id', tenantLoader, reservationController.deleteReservation);

export default reservationRouter;
