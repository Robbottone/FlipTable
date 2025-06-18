import { Request, Response, Router } from 'express';
import { tenantLoader } from '../../middleware/tenantLoader/tenantLoader';
import { TenantRequest } from '../../types/typedRequest';
import { prisma } from '../../../prisma/client';
import { MenuResponse } from './menu.types';

const menuRoute = Router()

menuRoute.get('/menu', tenantLoader, async (req: Request, res: Response) => {
    
    const tenantReq = req as TenantRequest;

    const foundMenu = await prisma.menu.findFirst({
        where: {
            tenantId: tenantReq.tenant.id
        },
        include: {
            menuItems: {
                include: {
                    menuItem: true,
                },
            }
        }
    })

    if (!foundMenu) {
        res.status(404).json({ error: 'Menu not found for this tenant' });
        return;
    }

    const menuResponse: MenuResponse = {
        id: foundMenu.id,
        name: foundMenu.name,
        items: foundMenu.menuItems.map(item => ({
            id: item.menuItemId,
            name: item.menuItem.name,
            description: item.menuItem.description,
            price: item.menuItem.price,
            visible: item.menuItem.visible,
            available: item.menuItem.available,
            tags: item.menuItem.tags
        }))
    }

    res.json({menuResponse});
});

menuRoute.get('/menu/:id', tenantLoader, async (req: Request, res: Response) => {

    const tenantReq = req as TenantRequest;
    const menuId = req.params.id;

    const foundMenu = await prisma.menu.findFirst({
        where: {
            tenantId: tenantReq.tenant.id,
            id: menuId
        },
        include: {
            menuItems: {
                include: {
                    menuItem: true,
                },
            }
        }
    });

    if (!foundMenu) {
        res.status(404).json({ error: 'Menu not found for this tenant and menuId' });
        return;
    }

    console.log('Found menu:', foundMenu);

    const menuResponse: MenuResponse = {
        id: foundMenu.id,
        name: foundMenu.name,
        items: foundMenu.menuItems.map(item => ({
            id: item.menuItem.id,
            name: item.menuItem.name,
            description: item.menuItem.description,
            price: item.menuItem.price,
            tags: item.menuItem.tags,
            visible: item.menuItem.visible,
            available: item.menuItem.available
        }))
    };

    res.json({menuResponse});
});

menuRoute.post('/menu/:menuid/items', tenantLoader, async (req: Request, res: Response) => {
    
    const tenantReq = req as TenantRequest; //per ottenere il menu rispetto al tenant
    const { menuId } = req.params;

    const menu = await prisma.menu.findFirst({
        where: {
            id: menuId,
            tenantId: tenantReq.tenant.id
        }
    });

    if (!menu) {
        res.status(404).json({ error: 'Menu not found for this tenant' });
        return;
    }

    // ids ora e' un array di stringhe dove controllo se e' una string per ogni id
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => typeof id === 'string')) {
        res.status(400).json({ error: 'Missing or invalid menuItem ids in body' });
        return;
    }

    // Devo controllare che ogni item id esista nel database
    const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: ids } }
    });

    if (menuItems.length !== ids.length) {
        res.status(404).json({ error: 'One or more MenuItems not found' });
        return;
    }

    const alreadyLinked = await prisma.menuItemsOnMenus.findMany({
        where: {
            menuId: menu!.id,
            menuItemId: { in: ids }
        }
    });

    const alreadyLinkedIds = alreadyLinked.map(i => i.menuItemId);
    const toLinkIds = ids.filter(id => !alreadyLinkedIds.includes(id));

    if (toLinkIds.length === 0) {
        res.status(409).json({ error: 'All MenuItems already linked to this menu.' });
        return;
    }

    // Link all not-yet-linked menuItems
    await prisma.menuItemsOnMenus.createMany({
        data: toLinkIds.map(menuItemId => ({
            menuId: menu!.id,
            menuItemId
        }))
    });

    res.status(201).json({ message: 'MenuItems added to menu successfully', added: toLinkIds });
});

menuRoute.delete('/menu/:menuId/items', tenantLoader, async (req: Request, res: Response) => {
    const tenantReq = req as TenantRequest; //per ottenere il menu rispetto al tenant
    const { menuId } = req.params;

    const menu = await prisma.menu.findFirst({
        where: {
            id: menuId,
            tenantId: tenantReq.tenant.id
        }
    });

    if (!menu) {
        res.status(404).json({ error: 'Menu not found for this tenant' });
        return;
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => typeof id === 'string')) {
        res.status(400).json({ error: 'Missing or invalid menuItem ids in body' });
        return;
    }

    // Devo controllare che ogni item id esista come menuItem. Infatti menuItem mi restituisce quelli che trova! 
    const foundItems = await prisma.menuItem.findMany({
        where: { id: { in: ids } }
    });

    //li deve aver trovati tutti, altrimenti non posso cancellare
    if (foundItems.length !== ids.length) {
        res.status(404).json({ error: 'One or more MenuItems not found' });
        return;
    }

    //Recupero i menuItemsOnMenus che voglio cancellare e anche se non esistono, non importa, prisma non li trova ed e' come non ci fossero
    const toDelete = await prisma.menuItemsOnMenus.findMany({
        where: {
            menuId: menu!.id,
            menuItemId: { in: ids }
        }
    });

    await prisma.menuItemsOnMenus.deleteMany({
        where: {
            menuId: menu!.id,
            menuItemId: { in: ids }
        }
    });

    //Restituisci gli item cancellati
    res.status(200).json({ message: 'MenuItems removed from menu successfully', removed: toDelete.map(item => item.menuItemId), notFound: ids.filter(id => !toDelete.some(item => item.menuItemId === id))   }); 
});


export default menuRoute