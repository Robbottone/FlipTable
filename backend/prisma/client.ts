// /prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
  
// In questo modo evitiamo di creare una nuova istanza di PrismaClient
//  ogni volta che il codice viene eseguito in modalità sviluppo,
//  dove il server potrebbe essere riavviato frequentemente.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}