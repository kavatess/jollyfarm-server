import express, { Application } from 'express';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { TrussRouter } from './core/truss/truss.routes';
import { SeedRouter } from './core/seed/seed.routes';
import { SeedStorageRouter } from './core/seed-storage/seed-storage.routes';
import { PlantRouter } from './core/plant/plant.routes';
// rest of the code remains same
const app: Application = express();
const PORT = process.env.PORT || 1000;
const allowedOrigins: string[] = ['http://localhost:4200',
    'http://yourapp.com', 'http://127.0.0.1:5500'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
app.use(helmet());
app.use(morgan('common'));
app.use(express.json());
app.use(TrussRouter);
app.use(PlantRouter);
app.use(SeedRouter);
app.use(SeedStorageRouter);

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});