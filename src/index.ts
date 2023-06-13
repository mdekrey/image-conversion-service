import express from 'express';
import { PORT } from '@/config';

const app = express();

app.use(express.json());
app.use('/health', (req, res) => {
	res.statusCode = 200;
	res.send('OK');
});

app.listen(PORT, () => console.log(`Listening at ${PORT}`));

export default app;
