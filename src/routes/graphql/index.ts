import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { graphql, parse, validate } from "graphql";
import depthLimit = require("graphql-depth-limit");
import { GraphQLID, GraphQLSchema } from "graphql/type";
import { getLoaders } from "./loaders";
import { Mutations } from "./mutation";
import { RootQuery } from "./query";
import { graphqlBodySchema } from "./schema";
import { Context } from "./types/context";
import { MemberType, UpdateMemberType } from "./types/memberType";
import { PostType, CreatePostType, UpdatePostType } from "./types/post";
import {
  ProfileType,
  CreateProfileType,
  UpdateProfileType,
} from "./types/profile";
import { UserType, CreateUserType, UpdateUserType } from "./types/user";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    "/",
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request) {
      const { query, mutation } = request.body;
      const source: string | null = query || mutation || null;

      if (!source) throw this.httpErrors.badRequest();

      const validationResult = validate(schema, parse(source), [depthLimit(5)]);

      if (validationResult.length) throw validationResult;

      const contextValue: Context = {
        fastify,
        ...getLoaders(fastify.db),
      };

      return graphql({
        schema,
        source,
        contextValue,
      });
    }
  );
};

export default plugin;

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
  types: [
    UserType,
    ProfileType,
    PostType,
    MemberType,
    CreateUserType,
    CreatePostType,
    CreateProfileType,
    UpdateMemberType,
    UpdateUserType,
    UpdatePostType,
    UpdateProfileType,
    GraphQLID,
  ],
});
