import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from "./schemas";
import type { UserEntity } from "../../utils/DB/entities/DBUsers";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<UserEntity[]> {
    return await this.db.users.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await this.db.users.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!user) throw this.httpErrors.notFound();
      return user;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return await this.db.users.create({ ...request.body });
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const userToDelete = await this.db.users.findOne({
        key: "id",
        equals: id,
      });
      if (!userToDelete) throw this.httpErrors.badRequest();
      const profile = await this.db.profiles.findOne({
        key: "userId",
        equals: id,
      });
      if (profile) {
        await this.db.profiles.delete(profile.id);
      }
      const posts = await this.db.posts.findMany({ key: "userId", equals: id });
      posts.forEach((post) => this.db.posts.delete(post.id));
      const subs = await this.db.users.findMany({
        key: "subscribedToUserIds",
        inArray: id,
      });
      subs.forEach((sub) =>
        this.db.users.change(sub.id, {
          subscribedToUserIds: sub.subscribedToUserIds.filter(
            (subId) => subId !== id
          ),
        })
      );
      return this.db.users.delete(id);
    }
  );

  fastify.post(
    "/:id/subscribeTo",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscriberId = request.body.userId;
      const subscribeToId = request.params.id;
      const subscriber = await this.db.users.findOne({
        key: "id",
        equals: subscriberId,
      });
      if (!subscriber) throw this.httpErrors.notFound();
      const { subscribedToUserIds } = subscriber;
      return this.db.users.change(subscriberId, {
        subscribedToUserIds: [...subscribedToUserIds, subscribeToId],
      });
    }
  );

  fastify.post(
    "/:id/unsubscribeFrom",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const unsubscriberId = request.body.userId;
      const unsubscribeFromId = request.params.id;
      const unsub = await this.db.users.findOne({
        key: "id",
        equals: unsubscriberId,
      });
      if (!unsub) throw this.httpErrors.notFound();
      let { subscribedToUserIds } = unsub;
      if (!subscribedToUserIds.includes(unsubscribeFromId))
        throw this.httpErrors.badRequest();
      subscribedToUserIds = subscribedToUserIds.filter(
        (id) => id !== unsubscribeFromId
      );
      return this.db.users.change(unsubscriberId, { subscribedToUserIds });
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await this.db.users.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!user) throw this.httpErrors.badRequest();
      return await this.db.users.change(request.params.id, { ...request.body });
    }
  );
};

export default plugin;
