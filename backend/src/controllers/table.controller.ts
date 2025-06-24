// src/controllers/menuItem.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { TableTypeRequestBody } from "src/routes/table/table.types";
import { TenantRequest } from "src/types/typedRequest";
import { table } from "console";

const tableController = {
    createTable : async (req: Request, res: Response) => {

        const tenantReq = req as TenantRequest;

        const { tables }: TableTypeRequestBody = req.body;

        try {
            await prisma.table.createMany({
                data: tables.map((table) => ({
                    tenantId: tenantReq.tenant.id,
                    labelTable: table.labelTable,
                    seats: table.seats || 4, // Default to 4 seats if not provided
                    qrCodeId: table.qrCodeId || null // Optional QR code ID
                }))
            });

            res.status(201).json({ message: "Addded new tables."});
        } catch (error) {
            console.error("Error creating table:", error);
            res.status(500).json({ error: "Failed to create table" });
        }
    },
    deleteTable: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;
        const {tableIds} = req.body;

        try {
            await prisma.table.deleteMany({
                where: {
                    id: { in: tableIds},
                    tenantId: tenantReq.tenant.id,
                },
            });

            res.status(200).json({ message: `Table${tableIds.count() > 1 ? 's': ''} deleted successfully` });
        } catch (error) {
            console.error("Error deleting table:", error);
            res.status(500).json({ error: "Failed to delete table" });
        }
    },
    assignGroupToTable: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;

        const { tableId, groupId } = req.body;

        if (!tableId) {
            res.status(400).json({ error: "Table ID is required" });
            return;
        }

        if (!groupId) {
            res.status(400).json({ error: "Group ID is required" });
            return;
        }

        try {

            //prima di fare l'update controllo se il tavolo ha il tableGroupId già associato
            const existingTable = await prisma.table.findUnique({
                where: {
                    id: tableId,
                    tenantId: tenantReq.tenant.id,
                },
            })

            if (!existingTable) {
                res.status(404).json({ error: "Table not found" });
                return;
            }

            if (existingTable.tableGroupId === groupId) {
                res.status(400).json({ error: "Table is already assigned to this group" });
                return;
            }

            if (existingTable.tableGroupId !== null) {
                //se il tavolo ha gia un gruppo associate, devo controllare se tutti i conti su quel tavolo sono pagati
                const existingGroup = await prisma.tableGroup.findUnique({
                    where: { groupId: existingTable.tableGroupId },
                    include: {
                        orders: true, // Include orders to check if any are unpaid
                    },
                });

                //qui e' possibile che una nuova persona sposta il tavolo senza sapere che ci sono dei conti non pagati.
                //potrebbe aver senso che se l'utente che chiama la API e' admin, allora puo' cancellare il vecchio gruppo
                //altrimenti deve partire una notifica che avvisa admin del tavolo inconcluso.
                //qui bisogna pensarci bene!!
                if (existingGroup && existingGroup.orders.some(order => !order.isPaid)) {
                    res.status(400).json({ error: "Cannot assign table to a new group, all orders must be paid first." });
                    return;
                }
            }

            const updatedTable = await prisma.table.update({
                where: {
                    id: tableId,
                    tenantId: tenantReq.tenant.id,
                },
                data: {
                    tableGroupId: groupId, // Assign group ID or set to null
                },
            });

            res.status(200).json({ message: "Table assigned to group successfully", table: updatedTable });
        } catch (error) {
            console.error("Error assigning group to table:", error);
            res.status(500).json({ error: "Failed to assign group to table" });
        }
    },
    unboundGroupToTable: async (req: Request, res: Response) => {
        const tenantReq = req as TenantRequest;

        const { tableId, groupId } = req.body;

        if (!tableId) {
            res.status(400).json({ error: "Table ID is required" });
            return;
        }

        if (!groupId) {
            res.status(400).json({ error: "Group ID is required" });
            return;
        }

        try {

            //prima di fare l'unbound, devo controllare se il gruppo di tavoli, ha almeno un tavolo ancora associato
            const tableGroup = await prisma.tableGroup.findUnique({
                where: { groupId: groupId },
                include: {
                    tables: true,
                    orders: true, // Include orders to check if any are unpaid
                },
            });

            if(!tableGroup) {
                res.status(404).json({ error: "Table group not found" });
                return;
            }

            if(tableGroup?.tables.length === 1 && tableGroup.orders.length > 0 && tableGroup.orders.some(order => !order.isPaid)) {
                res.status(400).json({ error: "Cannot unbind group from table, at least one table must remain in the group." });
                return;
            }

            // Questo fa il detach del tavolo dal gruppo
            const updatedTable = await prisma.table.update({
                where: {
                    id: tableId,
                    tenantId: tenantReq.tenant.id,
                },
                data: {
                    tableGroupId: null, // Assign group ID or set to null
                },
            });


            res.status(200).json({ message: "Table assigned to group successfully", table: updatedTable });
        } catch (error) {
            console.error("Error assigning group to table:", error);
            res.status(500).json({ error: "Failed to assign group to table" });
        }
    }
}

export default tableController;