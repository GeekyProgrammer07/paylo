import dotenv from "dotenv";
import path from "path";
import app, { logger } from "./app";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = 3003;

app.listen(PORT, () => {
  logger.info(`Bank webhook listening on port ${PORT}`);
});
