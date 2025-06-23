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

   In alternativa genera il tuo __DATABASE_URL__ su __Prisma Studio__:  
   >    https://console.prisma.io
   - crea un progetto
   - vai nella sezione __database__
   - vai sulla tab __setup__
   - scegli __existing project__
   - premi __Generate database credentials__
   - copia il `DATABASE_URL` nel file `.env`
   
   Poi lancia il comando
   ```bash
   npx @prisma/ppg-tunnel --host 127.0.0.1 --port 52604
   ```  
   Ora sei connesso al db remoto.  
   In aggiunta puoi collegarlo al tuo 3rd party database editors (TablePlus, Dbeaver ecc.)  
   https://www.prisma.io/docs/postgres/database/tooling
   


5. Prepara il database ed esegui (opzionalmente) il seed iniziale - installare postgreSQL 17.5 windows poi esegui i comandi dalla cartella /backend

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

L'applicazione puo essere interrogata tramite POSTMAN con le query da importare da file in root di progetto.
