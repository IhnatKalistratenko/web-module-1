import express from "express";
import router from "./routes.js";

export const app = express();

const LEGACY_REGION = "eu-central-legacy";

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.use(router);

export default app;
