import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createProfileBodySchema, changeProfileBodySchema } from "./schema";
import type { ProfileEntity } from "../../utils/DB/entities/DBProfiles";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<ProfileEntity[]> {
    return await this.db.profiles.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await this.db.profiles.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!profile) throw this.httpErrors.notFound();
      return profile;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { userId, memberTypeId } = request.body;
      const user = await this.db.users.findOne({ key: "id", equals: userId });
      const memberType = await this.db.memberTypes.findOne({
        key: "id",
        equals: memberTypeId,
      });
      if (!user || !memberType) throw this.httpErrors.badRequest();
      const profile = await this.db.profiles.findOne({
        key: "userId",
        equals: request.body.userId,
      });
      if (profile) throw this.httpErrors.badRequest();
      return await this.db.profiles.create({ ...request.body });
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        return await this.db.profiles.delete(request.params.id);
      } catch {
        throw this.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await this.db.profiles.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!profile) throw this.httpErrors.badRequest();
      return this.db.profiles.change(request.params.id, request.body);
    }
  );
};

export default plugin;
