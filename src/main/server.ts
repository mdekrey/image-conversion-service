import express from 'express';
import { PORT } from '@/config';
import routes from '@/routes';
import { apiKeyMiddleware } from './apiKeyMiddleware';

const app = express();

app.use(express.json());
app.use(/^\/$/, (req, res) => {
	res.statusCode = 200;
	res.send('OK');
});
app.use(apiKeyMiddleware);

// TODO: API Key middleware
for (const route of routes) {
	app.use(route);
}

app.listen(PORT, () => console.log(`Listening at ${PORT}`));

export default app;
