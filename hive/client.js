import { Client } from "@hiveio/dhive";
import SERVERS from "./servers.js";

const client = new Client(SERVERS, {
    timeout: 3000,
    failoverThreshold: 3,
    consoleOnFailover: true
  });

  export default client