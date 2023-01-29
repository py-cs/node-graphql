import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { graphql, parse, validate } from "graphql";
import * as depthLimit from "graphql-depth-limit";
import { GraphQLSchema } from "graphql/type";
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

const DEPTH_LIMIT = 5;

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
    async function (request, responce) {
      const { query: source, variables: variableValues } = request.body;

      if (!source) throw this.httpErrors.badRequest();

      const validationResult = validate(schema, parse(source), [
        depthLimit(DEPTH_LIMIT),
      ]);

      if (validationResult.length) {
        responce.send({ errors: validationResult });
      } else {
        const { db } = fastify;

        const contextValue: Context = {
          db,
          ...getLoaders(fastify.db),
        };

        return graphql({
          schema,
          source,
          variableValues,
          contextValue,
        });
      }
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
  ],
});
