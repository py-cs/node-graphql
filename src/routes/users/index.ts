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
      const user = await this.db.users.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!user) throw this.httpErrors.notFound();
      const { subscribedToUserIds } = user;
      return this.db.users.change(request.params.id, {
        subscribedToUserIds: [...subscribedToUserIds, request.body.userId],
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
      const user = await this.db.users.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!user) throw this.httpErrors.notFound();
      let { subscribedToUserIds } = user;
      const idToUnsubscribe = request.body.userId;
      if (!subscribedToUserIds.includes(idToUnsubscribe))
        throw this.httpErrors.badRequest();
      subscribedToUserIds = subscribedToUserIds.filter(
        (id) => id !== idToUnsubscribe
      );
      return this.db.users.change(request.params.id, { subscribedToUserIds });
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
