import express from 'express';
import { PORT } from '@/config';
import routes from '@/routes';

const app = express();

app.use(express.json());
app.use('/health', (req, res) => {
	res.statusCode = 200;
	res.send('OK');
});

// TODO: API Key middleware
for (const route of routes) {
	app.use(route);
}

app.listen(PORT, () => console.log(`Listening at ${PORT}`));

export default app;
