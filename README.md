# FlipTable
web app useful to make an order directly from home or your table

## Avvio in sviluppo

1. Assicurati di avere installato **Node.js** (versione 18 o superiore) e `npm`.
2. Installa le dipendenze del progetto eseguendo, nella cartella principale:

   ```bash
   npm install
   ```

3. Installa le dipendenze del backend:

   ```bash
   cd backend
   npm install
   ```

4. Crea un file `.env` nella cartella `backend` con almeno le seguenti variabili:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/fliptable
   PORT=3001
   ```

5. Prepara il database ed esegui (opzionalmente) il seed iniziale:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. Avvia il server backend:

   ```bash
   npx ts-node src/server.ts
   ```

7. Apri un nuovo terminale, torna alla cartella principale e avvia l'applicazione Next.js in modalità sviluppo:

   ```bash
   npm run dev
   ```

L'applicazione sarà accessibile su `http://localhost:3000` mentre l'API backend risponderà sulla porta `3001` (o quella impostata in `.env`).
