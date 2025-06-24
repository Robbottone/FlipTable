
import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { randomUUID } from 'crypto';
import { TenantRequest } from 'src/types/typedRequest';

const tableGroupController = {
    createTableGroup: async (req: Request, res: Response) => {
        try {
                const tenantReq = req as TenantRequest; 

                let {tableIds, groupName} = req.body;
                
                if (!tableIds || !Array.isArray(tableIds) || tableIds.length < 2) {
                    res.status(400).json({error: "At least two table IDs are required to create a group"});
                    return;
                }

                groupName = groupName ?? tenantReq.tenant.name + " " +randomUUID(); // Genera un nome randomico

                await prisma.tableGroup.create({
                    data: {
                        name: groupName,
                        tenant: {
                            connect: { id: tenantReq.tenant.id } // Connect to the tenant
                        },
                        tables: {
                            connect: tableIds.map(id => ({ id })), // Connect existing tables by their IDs
                        }
                    }
                });

                // Logic to create a new table group
                res.status(201).json({ message: "Table group created successfully" });
            }
        catch (error: any) {
            console.error('Error creating table group:', error);
            res.status(500).json({ error: "An error occurred while creating the table group" });
        }
    },
    
    deleteTableGroup: async (req: Request, res: Response) => {
        try {
            const tenantReq = req as TenantRequest; 
            const { groupId } = req.params;

            if (!groupId) {
                res.status(400).json({ error: "Group ID is required" });
                return;
            }

            //deve controlarre se il conto dell'ordine associato al gruppo di tavoli è pagato
            //devo capire come associare il conto dell'ordine al gruppo di tavoli 
            const tableGroup = await prisma.tableGroup.findUnique({
                where: { groupId: groupId },
                include: {
                    orders: true
                }
            })
            
            if (!tableGroup ) {
                res.status(404).json({ error: "Table group not found" });
                return;
            }

            if (tableGroup.orders.length == 0 || tableGroup.orders.every(order => order.isPaid)) {
                await prisma.tableGroup.delete({
                    where: { groupId: groupId }
                });
            } else {
                res.status(400).json({ error: "Cannot delete table group with unpaid orders" });
                return;
            }
            //pero posso fare un gruppo priama di aver fatto un ordine, quindi in quel caso posso cancellare il gruppo.

            await prisma.tableGroup.delete({
                where: { groupId: groupId }
            });

            res.status(200).json({ message: "Table group deleted successfully" });
        } catch (error: any) {
            console.error('Error deleting table group:', error);
            res.status(500).json({ error: "An error occurred while deleting the table group" });
        }
    }
}
