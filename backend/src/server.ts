//devo importare express - cors - dotenv.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import menuRoute from './routes/menu/menu';
import menuItemRoute from './routes/menuItem/menuItem';

//devo inizializzare express e cors.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001
app.use(cors());
app.use(express.json())

app.use('/api', menuRoute);
app.use('/api', menuItemRoute);

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
})


//da qui in poi devo importare le rotte.

app.listen(PORT, () => {
  console.log(`✅ Backend in ascolto su http://localhost:${PORT}`)
})