import { Request, Response } from 'express';
import { TenantRequest } from 'src/types/typedRequest';
import { ReservationStatus } from '@prisma/client';
import { ReservationStatusType } from 'src/types/typedReservationStatus';
import { ReservationStateMachine } from 'src/stateMachine/reservationStateMachine';

const reservationController = {
    getAllReservation: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;

        try {
            const reservations = await prisma.reservation.findMany({
                where: {
                    tenantId: tenantReq.tenant.id,
                },
                include: {
                    table: true,
                }
            });

            res.status(200).json(reservations);
        } catch (error) {
            console.error("Error fetching reservations:", error);
            res.status(500).json({ error: "Failed to fetch reservations" });
        }
    },
    getReservationByPhoneNumber: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            res.status(400).json({ error: "Phone number is required" });
            return;
        }

        try {
            const reservation = await prisma.reservation.findFirst({
                where: {
                    tenantId: tenantReq.tenant.id,
                    phoneNumber: String(phoneNumber),
                },
                include: {
                    table: true,
                }
            });

            if (!reservation) {
                return res.status(404).json({ error: "Reservation not found" });
            }

            res.status(200).json(reservation);
        } catch (error) {
            console.error("Error fetching reservation by phone number:", error);
            res.status(500).json({ error: "Failed to fetch reservation" });
        }
    },
    getReservationByEmail: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }

        try {
            const userReservation = await prisma.user.findFirst({
                where: {
                    tenantId: tenantReq.tenant.id,
                    email: String(email),
                },
                include: {
                    reservation: true
                }
            });

            if (!userReservation) {
                return res.status(404).json({ error: "Reservation not found" });
            }

            res.status(200).json(userReservation);
        } catch (error) {
            console.error("Error fetching reservation by email:", error);
            res.status(500).json({ error: "Failed to fetch reservation" });
        }
    },
    createReservation: async (req: Request, res: Response) => {

        const tenantReq = req as TenantRequest;

        const { phoneNumber, email, date, reservationTime, people, firstName, lastName, tableId } = req.body;

        //il tavolo deve essere associato al momento che mi siedo al tavolo.

        if (!phoneNumber || !date || !reservationTime) {
            res.status(400).json({ error: "Table ID, phone number, date and time are required" });
            return;
        }

        try {
            const reservation = await prisma.reservation.create({
                data: {
                    phoneNumber: String(phoneNumber),
                    email: email ? String(email) : null,
                    date: new Date(date),
                    reservationTime: new Date(reservationTime),
                    tenantId: tenantReq.tenant.id,
                    people: people ? Number(people) : 1, // Default to 1 if not provided
                    firstName: firstName ? String(firstName) : null,
                    lastName: lastName ? String(lastName) : null,
                    tableId: tableId ? String(tableId) : null, // Optional, can be null if not set
                    status: ReservationStatus.CREATED, // Default status is set in the schema
                },
            });

            res.status(201).json(reservation);
        } catch (error) {
            console.error("Error creating reservation:", error);
            res.status(500).json({ error: "Failed to create reservation" });
        }
    },
    setTableToReservation: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;
        
        const { reservationId, tableId } = req.body;

        if (!reservationId || !tableId) {
            res.status(400).json({ error: "Reservation ID and Table ID are required" });
            return;
        }

        try {
            const reservation = await prisma.reservation.update({
                where: {
                    id: String(reservationId),
                    tenantId: tenantReq.tenant.id,
                    tableId: null, // Ensure the table is not already set
                },
                data: {
                    tableId: String(tableId),
                },
            });

            res.status(200).json(reservation);
        } catch (error) {
            console.error("Error setting table to reservation:", error);
            res.status(500).json({ error: "Failed to set table to reservation" });
        }
    },
    deleteReservation: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;
        const { reservationId } = req.body;

        if (!reservationId) {
            res.status(400).json({ error: "Reservation ID is required" });
            return;
        }

        try {
            const deletedReservation = await prisma.reservation.delete({
                where: {
                    id: String(reservationId),
                    tenantId: tenantReq.tenant.id,
                },
            });

            res.status(200).json(deletedReservation);
        } catch (error) {
            console.error("Error deleting reservation:", error);
            res.status(500).json({ error: "Failed to delete reservation" });
        }
    },
    updateReservationStatus: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;
        const { reservationId, status } = req.body;

        if (!reservationId || !status) {
            res.status(400).json({ error: "Reservation ID and status are required" });
            return;
        }

        try {

            const reservation = await prisma.reservation.findUnique({
                where: {
                    id: String(reservationId),
                    tenantId: tenantReq.tenant.id,
                }
            })

            // Validate the status against the ReservationStatus enum
            if (ReservationStateMachine.transition(reservation.status, status as ReservationStatus) === undefined) {
                res.status(400).json({ error: `Invalid status transition from ${reservation.status} to ${status}` });
                return;
            }

            const updatedReservation = await prisma.reservation.update({
                where: {
                    id: String(reservationId),
                    tenantId: tenantReq.tenant.id,
                },
                data: {
                    status: status as ReservationStatusType, // Ensure status is a valid enum value
                },
            });

            res.status(200).json(updatedReservation);
        } catch (error) {
            console.error("Error updating reservation status:", error);
            res.status(500).json({ error: "Failed to update reservation status" });
        }
    }
}