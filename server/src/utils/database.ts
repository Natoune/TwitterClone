import mongoose from "mongoose";
import { MONGODB_URI } from "./constants";
import logger from "./logger";

mongoose.set('strictQuery', true);

mongoose.connect(MONGODB_URI).then((info) => {
    logger.info(`Connected to MongoDB database ${info.connections[0].name} on ${info.connections[0].host}:${info.connections[0].port}`.yellow);
}).catch((err) => {
    logger.error(`Error connecting to MongoDB database: ${err}`.red);
});
