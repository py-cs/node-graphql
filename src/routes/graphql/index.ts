import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { graphql, parse, validate } from "graphql";
import depthLimit = require("graphql-depth-limit");
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from "graphql/type";
import { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";
import { PostEntity } from "../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../utils/DB/entities/DBUsers";
import { getLoaders } from "./loaders";
import { graphqlBodySchema } from "./schema";
import { GraphQLUUID } from "./types/uuid";

type Context = ReturnType<typeof getLoaders> & { fastify: FastifyInstance };

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
    async function (request, reply) {
      const { query, mutation, variables } = request.body;
      const source: string | null = query || mutation || null;

      if (!source) throw this.httpErrors.badRequest();

      const validationResult = validate(schema, parse(source), [depthLimit(5)]);

      if (validationResult.length) throw validationResult;

      const contextValue = {
        fastify,
        ...getLoaders(fastify.db),
      };

      return graphql({
        schema,
        source,
        variableValues: variables,
        contextValue,
      });
    }
  );
};

export default plugin;

const memberType: GraphQLObjectType = new GraphQLObjectType({
  name: "MemberType",
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const updateMemberType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "UpdateMemberTypeDTO",
  fields: () => ({
    discount: { type: GraphQLFloat },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

const postType: GraphQLObjectType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLUUID },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: new GraphQLNonNull(userType),
      resolve: (post: PostEntity, args, ctx: Context) => {
        return ctx.userLoader.load(post.userId);
      },
    },
  }),
});

const createPostType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "CreatePostDTO",
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLUUID) },
  }),
});

const updatePostType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "UpdatePostDTO",
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLUUID },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    profile: {
      type: profileType,
      resolve: (user: UserEntity, args, ctx: Context) => {
        return ctx.fastify.db.profiles.findOne({
          key: "userId",
          equals: user.id,
        });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (user: UserEntity, args, ctx: Context) => {
        return ctx.fastify.db.posts.findMany({
          key: "userId",
          equals: user.id,
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: (user: UserEntity, args, ctx: Context) => {
        return ctx.fastify.db.users.findMany({
          key: "subscribedToUserIds",
          inArray: user.id,
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: (user: UserEntity, args, ctx: Context) => {
        return ctx.fastify.db.users.findMany({
          key: "id",
          equalsAnyOf: user.subscribedToUserIds,
        });
      },
    },
  }),
});

const createUserType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "CreateUserDTO",
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const updateUserType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "UpdateUserDTO",
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

const profileType: GraphQLObjectType = new GraphQLObjectType({
  name: "Profile",
  fields: () => ({
    id: { type: GraphQLUUID },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: new GraphQLNonNull(userType) },
    memberType: {
      type: new GraphQLNonNull(memberType),
      resolve: async (profile: ProfileEntity, args, ctx: Context) => {
        // return ctx.fastify.db.memberTypes.findOne({
        //   key: "id",
        //   equals: profile.memberTypeId,
        // });
        return ctx.memberTypeLoader.load(profile.memberTypeId);
      },
    },
  }),
});

const createProfileType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "CreateProfileDTO",
  fields: () => ({
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLUUID) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const updateProfileType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "UpdateProfileDTO",
  fields: () => ({
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    userId: { type: GraphQLUUID },
    memberTypeId: { type: GraphQLString },
  }),
});

export const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    memberTypes: {
      type: new GraphQLList(memberType),
      resolve: (obj, args, ctx: Context) => {
        return ctx.fastify.db.memberTypes.findMany();
      },
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (obj, args, ctx: Context) => {
        // return ctx.fastify.db.memberTypes.findOne({
        //   key: "id",
        //   equals: args.id,
        // });
        return ctx.memberTypeLoader.load(args.id);
      },
    },
    users: {
      type: new GraphQLList(userType),
      resolve: (obj, args, ctx: Context) => {
        return ctx.fastify.db.users.findMany();
      },
    },
    user: {
      type: userType,
      args: {
        id: { type: GraphQLUUID },
      },
      resolve: (obj, args, ctx: Context) => {
        // return ctx.fastify.db.users.findOne({ key: "id", equals: args.id });
        return ctx.userLoader.load(args.id);
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (obj, args, ctx: Context) => {
        return ctx.fastify.db.posts.findMany();
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: GraphQLUUID },
      },
      resolve: (obj, args, ctx: Context) => {
        // return ctx.fastify.db.posts.findOne({ key: "id", equals: args.id });
        return ctx.postLoader.load(args.id);
      },
    },
    profiles: {
      type: new GraphQLList(profileType),
      resolve: (obj, args, ctx: Context) => {
        return ctx.fastify.db.profiles.findMany();
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: GraphQLUUID },
      },
      resolve: (obj, args, ctx: Context) => {
        // return ctx.fastify.db.profiles.findOne({ key: "id", equals: args.id });
        return ctx.profileLoader.load(args.id);
      },
    },
  },
});

const Mutations = new GraphQLObjectType({
  name: "Mutations",
  fields: {
    createUser: {
      type: userType,
      args: {
        createUserDTO: { type: createUserType },
      },
      async resolve(obj, args, ctx: Context) {
        return ctx.fastify.db.users.create(args.createUserDTO);
      },
    },
    createProfile: {
      type: profileType,
      args: {
        createProfileDTO: { type: createProfileType },
      },
      async resolve(obj, args, ctx: Context) {
        return ctx.fastify.db.profiles.create(args.createProfileDTO);
      },
    },
    createPost: {
      type: postType,
      args: {
        createPostDTO: { type: createPostType },
      },
      async resolve(obj, args, ctx: Context) {
        return ctx.fastify.db.posts.create(args.createPostDTO);
      },
    },
    updateMemberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        updateMemberTypeDTO: { type: updateMemberType },
      },
      async resolve(memberType: MemberTypeEntity, args, ctx: Context) {
        return ctx.fastify.db.memberTypes.change(
          args.id,
          args.updateMemberTypeDTO
        );
      },
    },
    updatePost: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updatePostDTO: { type: updatePostType },
      },
      async resolve(post: PostEntity, args, ctx: Context) {
        return ctx.fastify.db.posts.change(args.id, args.updatePostDTO);
      },
    },
    updateProfile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateProfileDTO: { type: updateProfileType },
      },
      async resolve(_, args, ctx: Context) {
        return ctx.fastify.db.profiles.change(args.id, args.updateProfileDTO);
      },
    },
    updateUser: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateUserDTO: { type: updateUserType },
      },
      async resolve(_, args, ctx: Context) {
        return ctx.fastify.db.users.change(args.id, args.updateUserDTO);
      },
    },
    subscribeTo: {
      type: userType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLUUID) },
        subscriberId: { type: new GraphQLNonNull(GraphQLUUID) },
      },
      resolve: async (_, args, ctx: Context) => {
        const { userId, subscriberId } = args;
        // const subscriber = await ctx.fastify.db.users.findOne({
        //   key: "id",
        //   equals: subscriberId,
        // });
        // const user = await ctx.fastify.db.users.findOne({
        //   key: "id",
        //   equals: userId,
        // });
        const [user, subscriber] = (await ctx.userLoader.loadMany([
          userId,
          subscriberId,
        ])) as UserEntity[];
        if (
          user &&
          subscriber &&
          !user.subscribedToUserIds.includes(subscriberId)
        ) {
          const subscribedToUserIds = [
            ...user.subscribedToUserIds,
            subscriberId,
          ];
          console.log(userId, subscribedToUserIds);
          return await ctx.fastify.db.users.change(userId, {
            subscribedToUserIds,
          });
        }
      },
    },
    unsubscribeFrom: {
      type: userType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLUUID) },
        unsubId: { type: new GraphQLNonNull(GraphQLUUID) },
      },
      resolve: async (_, args, ctx: Context) => {
        const { userId, unsubId } = args;
        // const unsub = await ctx.fastify.db.users.findOne({
        //   key: "id",
        //   equals: unsubId,
        // });
        // const user = await ctx.fastify.db.users.findOne({
        //   key: "id",
        //   equals: userId,
        // });
        throw ctx.fastify.httpErrors.badRequest();
        const [user, unsub] = (await ctx.userLoader.loadMany([
          userId,
          unsubId,
        ])) as UserEntity[];
        if (user && unsub && user.subscribedToUserIds.includes(unsubId)) {
          console.log("ready to unsub");
          const subscribedToUserIds = user.subscribedToUserIds.filter(
            (id) => id !== unsubId
          );
          return ctx.fastify.db.users.change(userId, { subscribedToUserIds });
        }
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
});
