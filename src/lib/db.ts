import { type DBSchema, openDB } from "idb";
import type { ICacheDB } from "~/entries/background/main";
import type { IHistoryDB } from "./history";

interface IDB extends DBSchema {
  history: IHistoryDB;
  cache: ICacheDB;
}

export const db = openDB<IDB>("hy", 1, {
  async upgrade(db) {
    const historyTable = db.createObjectStore("history", {
      autoIncrement: true,
    });
    historyTable.createIndex("keys", "keys", { unique: true });
    historyTable.createIndex("service", "service", { unique: false });
    historyTable.createIndex("query", "query", { unique: false });
    historyTable.createIndex("time", "time");

    const cacheTable = db.createObjectStore("cache", { keyPath: "url" });
    cacheTable.createIndex("url", "url", { unique: true });
    cacheTable.createIndex("time", "time", { unique: true });
  },
});
