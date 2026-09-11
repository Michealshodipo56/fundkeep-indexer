import { createServer } from "./api/server.js";
import { config } from "./config.js";
import { startPolling } from "./poller.js";

const app = createServer();

app.listen(config.port, () => {
  console.log(`[fundkeep-indexer] listening on :${config.port}`);
});

startPolling();
console.log(
  `[fundkeep-indexer] polling ${config.contractId} every ${config.pollIntervalMs}ms`
);
