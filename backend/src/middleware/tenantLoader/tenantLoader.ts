import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../prisma/client';

export async function tenantLoader(
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> {
    
    const tenantSlug = req.query.tenant_slug;

    if (typeof tenantSlug !== 'string' || tenantSlug.trim() === '') {
        res.status(400).json({ error: 'Invalid tenant slug' });
        return;
    }

    const foundTenant = await prisma.tenant.findUnique({where: { slug: tenantSlug } });

    if (!foundTenant) {
        res.status(404).json({ error: 'Tenant not found' });
        return;
    }

    ;(req as any).tenant = foundTenant;

    next();
}