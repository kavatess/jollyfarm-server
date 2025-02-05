import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { AuthRouter } from "./auth/authentication.route";
import { TrussRouter } from "./core/truss/truss.route";
import { SeedRouter } from "./core/seed/seed.route";
import { PlantRouter } from "./core/plant/plant.route";
import { HistoryRouter } from "./core/history/history.route";
import dotenv from "dotenv";

// Initialize application variables
dotenv.config(); // Load environment variables from .env file
const app: Application = express();
const PORT = process.env.PORT || 10000;
const allowedOrigins: string[] = ['http://localhost:4000', 'http://localhost:4200', 'https://jolly-angular.vercel.app'];
// Activate additional libraries
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
app.use(morgan("common"));
app.use(express.json());
// Set programmed router application
app.use(AuthRouter);
app.use(TrussRouter);
app.use(PlantRouter);
app.use(SeedRouter);
app.use(HistoryRouter);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
