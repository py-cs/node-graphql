import DB from "../../../utils/DB/DB";
import { getLoaders } from "../loaders";

export type Context = ReturnType<typeof getLoaders> & {
  db: DB;
};
