// src/controllers/menuItem.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { TableTypeRequestBody } from "src/routes/table/tabel.types";
import { TenantRequest } from "src/types/typedRequest";

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
    }
}