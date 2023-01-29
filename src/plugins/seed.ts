import fp from "fastify-plugin";
import DB from "../utils/DB/DB";
import { PostEntity } from "../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../utils/DB/entities/DBProfiles";
import { UserEntity } from "../utils/DB/entities/DBUsers";

const config = {
  users: 10, // Number of users with profiles to create
  maxPostsPerUser: 6, // Max number of posts for each user (random value from 1 to this limit)
  subscriptions: 30, // Total number of random subscriptions
};

export default fp(async (fastify): Promise<void> => {
  const { db } = fastify;
  seed(db);
});

function getRandomItem<T>(arr: T[]): T {
  const { length } = arr;
  const index = Math.trunc(Math.random() * length);
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
  const { users, maxPostsPerUser, subscriptions } = config;
  const userIds: string[] = [];

  for (let i = 0; i < users; i++) {
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

    for (let j = 0; j < 1 + Math.random() * maxPostsPerUser; j++) {
      const postDTO: Omit<PostEntity, "id"> = {
        title: `post #${i * 10 + j}`,
        content: "lorem ipsum dolor est",
        userId: user.id,
      };
      await db.posts.create(postDTO);
    }
  }

  for (let i = 0; i < subscriptions; i++) {
    while (true) {
      const idsPair = getPair(userIds);
      console.log(idsPair);

      let [user, subscriber] = await db.users.findMany({
        key: "id",
        equalsAnyOf: idsPair,
      });

      if (Math.random() > 0.5) {
        [user, subscriber] = [subscriber, user];
      }

      if (user.subscribedToUserIds.includes(subscriber.id)) continue;

      await db.users.change(user.id, {
        subscribedToUserIds: [...user.subscribedToUserIds, subscriber.id],
      });

      break;
    }
  }
}
