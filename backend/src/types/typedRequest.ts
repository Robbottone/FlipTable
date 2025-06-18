import { Request } from 'express'
import { Tenant } from '@prisma/client'

export interface TenantRequest extends Request{
  tenant: Tenant
}