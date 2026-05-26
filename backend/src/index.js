import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend JS server is running smoothly!' });
});

app.listen(PORT, () => {
  console.log(`Express Server is running at http://localhost:${PORT}`);
});