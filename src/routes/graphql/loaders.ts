import DataLoader = require("dataloader");
import DB from "../../utils/DB/DB";
import DBEntity from "../../utils/DB/entities/DBEntity";
import { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";
import { PostEntity } from "../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../utils/DB/entities/DBUsers";

export function getLoaders(db: DB) {
  const memberTypeLoader = createLoader<MemberTypeEntity>(db.memberTypes, "id");
  const postLoader = createLoader<PostEntity>(db.posts, "id");
  const userLoader = createLoader<UserEntity>(db.users, "id");
  const profileLoader = createLoader<ProfileEntity>(db.profiles, "id");
  const profileByUserIdLoader = createLoader<ProfileEntity>(
    db.profiles,
    "userId"
  );

  return {
    memberTypeLoader,
    postLoader,
    userLoader,
    profileLoader,
    profileByUserIdLoader,
  };
}

export function createLoader<
  T extends MemberTypeEntity | UserEntity | ProfileEntity | PostEntity
>(db: DBEntity<T, unknown, unknown>, key: keyof T) {
  const batchFn = async (keys: Readonly<string[]>) => {
    const results = await db.findMany({
      key,
      equalsAnyOf: [...keys],
    } as any);
    const resultsMap = results.reduce((acc, item: T) => {
      acc.set(item.id, item);
      return acc;
    }, new Map<string, T>());
    return keys.map((key) => resultsMap.get(key) ?? null);
  };

  return new DataLoader(batchFn);
}
