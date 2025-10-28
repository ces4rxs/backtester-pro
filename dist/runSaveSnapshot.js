import { saveMarketSnapshot } from "./data/saveMarketSnapshot.js";
import fs from "fs";
const bars = JSON.parse(fs.readFileSync("./src/data/sample_btc_usd_1d.json", "utf-8"));
await saveMarketSnapshot("BTCUSD", "1d", bars);
