import DataLoader = require("dataloader");
import DB from "../../utils/DB/DB";
import { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";
import { PostEntity } from "../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../utils/DB/entities/DBUsers";

export function getLoaders(db: DB) {
  const memberTypeLoader = new DataLoader<string, MemberTypeEntity | null>(
    async (keys: Readonly<string[]>) =>
      db.memberTypes.findMany({
        key: "id",
        equalsAnyOf: [...keys],
      })
  );

  const postLoader = new DataLoader<string, PostEntity | null>(
    async (keys: Readonly<string[]>) =>
      db.posts.findMany({
        key: "id",
        equalsAnyOf: [...keys],
      })
  );

  const userLoader = new DataLoader<string, UserEntity | null>(
    async (keys: Readonly<string[]>) =>
      db.users.findMany({
        key: "id",
        equalsAnyOf: [...keys],
      })
  );

  const profileLoader = new DataLoader<string, ProfileEntity | null>(
    async (keys: Readonly<string[]>) =>
      db.profiles.findMany({
        key: "id",
        equalsAnyOf: [...keys],
      })
  );

  return { memberTypeLoader, postLoader, userLoader, profileLoader };
}
