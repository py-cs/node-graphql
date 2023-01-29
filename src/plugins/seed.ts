import fp from "fastify-plugin";
import DB from "../utils/DB/DB";
import { PostEntity } from "../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../utils/DB/entities/DBProfiles";
import { UserEntity } from "../utils/DB/entities/DBUsers";

export default fp(async (fastify): Promise<void> => {
  const { db } = fastify;
  seed(db);
});

function getRandomItem<T>(arr: T[]): T {
  const { length } = arr;
  const index = Math.round(Math.random() * (length - 1));
  return arr[index];
}

function getPair<T>(arr: T[]): [T, T] {
  let pair: [T, T] = [getRandomItem(arr), getRandomItem(arr)];
  while (pair[0] === pair[1]) {
    pair = getPair(arr);
  }
  return pair;
}

export async function seed(db: DB) {
  const userIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const userDTO: Omit<UserEntity, "id" | "subscribedToUserIds"> = {
      firstName: `User ${i}`,
      lastName: `Last ${i}`,
      email: `user${i}@mail.com`,
    };
    const user = await db.users.create(userDTO);
    userIds.push(user.id);

    const profileDTO: Omit<ProfileEntity, "id"> = {
      avatar: `avatar ${i}`,
      sex: getRandomItem(["male", "female"]),
      birthday: Number(new Date()),
      country: getRandomItem(["us", "uk", "ca", "cn", "ru"]),
      street: "Street",
      city: "City",
      memberTypeId: getRandomItem(["basic", "business"]),
      userId: user.id,
    };
    await db.profiles.create(profileDTO);

    for (let j = 0; j < 1 + Math.random() * 6; j++) {
      const postDTO: Omit<PostEntity, "id"> = {
        title: `post #${i * 10 + j}`,
        content: "lorem ipsum dolor est",
        userId: user.id,
      };
      await db.posts.create(postDTO);
    }
  }

  for (let i = 1; i < 30; i++) {
    const idsPair = getPair(userIds);

    const [user, subscriber] = await db.users.findMany({
      key: "id",
      equalsAnyOf: idsPair,
    });
    await db.users.change(user.id, {
      subscribedToUserIds: [...user.subscribedToUserIds, subscriber.id],
    });
  }
}
