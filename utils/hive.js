import client from "../hive/client.js";

export const getAccountHistory = (
  username,
  start,
  limit = 20,
  filters = []
) => {
  return Array.isArray(filters)
    ? client.call("condenser_api", "get_account_history", [username, 1000, limit, ...filters])
    : client.call("condenser_api", "get_account_history", [username, 1000, limit]);
};
