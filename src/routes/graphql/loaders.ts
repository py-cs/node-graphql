import DataLoader = require("dataloader");
import DB from "../../utils/DB/DB";
import DBEntity from "../../utils/DB/entities/DBEntity";
import { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";
import DBPosts, { PostEntity } from "../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import DBUsers, { UserEntity } from "../../utils/DB/entities/DBUsers";

function createLoader<
  T extends MemberTypeEntity | UserEntity | ProfileEntity | PostEntity
>(db: DBEntity<T, unknown, unknown>, key: keyof T) {
  const batchFn = async (keys: Readonly<string[]>) => {
    const results = await db.findMany({
      key,
      equalsAnyOf: [...keys],
    } as any);

    const resultsMap = results.reduce((acc, item: T) => {
      acc.set(item[key] as string, item);
      return acc;
    }, new Map<string, T>());

    return keys.map((key) => resultsMap.get(key) ?? null);
  };

  return new DataLoader(batchFn);
}

function createPostsByAuthorIdLoader(postsDB: DBPosts) {
  return new DataLoader(async (authorIds: Readonly<string[]>) => {
    const allPosts = await postsDB.findMany();
    return authorIds.map((authorId) =>
      allPosts.filter((post) => post.userId === authorId)
    );
  });
}

function createUserLoaders(usersDB: DBUsers) {
  const allUsersPromise = usersDB.findMany();

  const subscriptionsByUserIdLoader = new DataLoader(
    async (userIds: Readonly<string[]>) => {
      const allUsers = await allUsersPromise;
      return userIds.map((userId) =>
        allUsers.filter((user) => user.subscribedToUserIds.includes(userId))
      );
    }
  );

  const userLoader = new DataLoader(async (userIds: Readonly<string[]>) => {
    const allUsers = await allUsersPromise;
    return userIds.map((userId) => allUsers.find((user) => user.id === userId));
  });

  return { subscriptionsByUserIdLoader, userLoader };
}

export function getLoaders(db: DB) {
  const { memberTypes, posts, profiles, users } = db;

  const memberTypeLoader = createLoader<MemberTypeEntity>(memberTypes, "id");
  const postLoader = createLoader<PostEntity>(posts, "id");
  const profileLoader = createLoader<ProfileEntity>(profiles, "id");
  const profileByUserIdLoader = createLoader<ProfileEntity>(profiles, "userId");
  const postsByAuthorIdLoader = createPostsByAuthorIdLoader(posts);
  const { subscriptionsByUserIdLoader, userLoader } = createUserLoaders(users);

  return {
    memberTypeLoader,
    postLoader,
    userLoader,
    profileLoader,
    profileByUserIdLoader,
    postsByAuthorIdLoader,
    subscriptionsByUserIdLoader,
  };
}
