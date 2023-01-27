import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
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
import DB from "../../utils/DB/DB";
import { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";
import { PostEntity } from "../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../utils/DB/entities/DBUsers";
import { graphqlBodySchema } from "./schema";

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
      const source = query || mutation || null;

      if (!source) throw this.httpErrors.badRequest();

      const validationResult = validate(schema, parse(source), [depthLimit(5)]);

      if (validationResult.length)
        throw this.httpErrors.badRequest(validationResult[0].toString());

      return graphql({
        schema,
        source,
        variableValues: variables,
        contextValue: this.db,
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
    id: { type: GraphQLString },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: new GraphQLNonNull(userType),
      resolve: (post: PostEntity, args, ctx: DB) => {
        return ctx.users.findOne({ key: "id", equals: post.userId });
      },
    },
  }),
});

const createPostType: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: "CreatePostDTO",
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
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
    id: { type: GraphQLString },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    profile: {
      type: profileType,
      resolve: (user: UserEntity, args, ctx: DB) => {
        return ctx.profiles.findOne({ key: "userId", equals: user.id });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (user: UserEntity, args, ctx: DB) => {
        return ctx.posts.findMany({ key: "userId", equals: user.id });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: (user: UserEntity, args, ctx: DB) => {
        return ctx.users.findMany({
          key: "subscribedToUserIds",
          inArray: user.id,
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: (user: UserEntity, args, ctx: DB) => {
        return ctx.users.findMany({
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
    id: { type: GraphQLString },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: new GraphQLNonNull(userType) },
    memberType: {
      type: new GraphQLNonNull(memberType),
      resolve: async (profile: ProfileEntity, args, ctx: DB) => {
        return ctx.memberTypes.findOne({
          key: "id",
          equals: profile.memberTypeId,
        });
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
    userId: { type: new GraphQLNonNull(GraphQLString) },
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
    userId: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
  }),
});

export const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    memberTypes: {
      type: new GraphQLList(memberType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.memberTypes.findMany();
      },
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (obj, args, ctx: DB) => {
        return ctx.memberTypes.findOne({ key: "id", equals: args.id });
      },
    },
    users: {
      type: new GraphQLList(userType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.users.findMany();
      },
    },
    user: {
      type: userType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (obj, args, ctx: DB) => {
        return ctx.users.findOne({ key: "id", equals: args.id });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.posts.findMany();
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (obj, args, ctx: DB) => {
        return ctx.posts.findOne({ key: "id", equals: args.id });
      },
    },
    profiles: {
      type: new GraphQLList(profileType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.profiles.findMany();
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (obj, args, ctx: DB) => {
        return ctx.profiles.findOne({ key: "id", equals: args.id });
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
      async resolve(obj, args, ctx: DB) {
        return ctx.users.create(args.createUserDTO);
      },
    },
    createProfile: {
      type: profileType,
      args: {
        createProfileDTO: { type: createProfileType },
      },
      async resolve(obj, args, ctx: DB) {
        return ctx.profiles.create(args.createProfileDTO);
      },
    },
    createPost: {
      type: postType,
      args: {
        createPostDTO: { type: createPostType },
      },
      async resolve(obj, args, ctx: DB) {
        return ctx.posts.create(args.createPostDTO);
      },
    },
    updateMemberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        updateMemberTypeDTO: { type: updateMemberType },
      },
      async resolve(memberType: MemberTypeEntity, args, ctx: DB) {
        return ctx.memberTypes.change(args.id, args.updateMemberTypeDTO);
      },
    },
    updatePost: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        updatePostDTO: { type: updatePostType },
      },
      async resolve(post: PostEntity, args, ctx: DB) {
        return ctx.posts.change(args.id, args.updatePostDTO);
      },
    },
    updateProfile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        updateProfileDTO: { type: updateProfileType },
      },
      async resolve(_, args, ctx: DB) {
        return ctx.profiles.change(args.id, args.updateProfileDTO);
      },
    },
    updateUser: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        updateUserDTO: { type: updateUserType },
      },
      async resolve(_, args, ctx: DB) {
        return ctx.users.change(args.id, args.updateUserDTO);
      },
    },
    subscribeTo: {
      type: userType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        subscriberId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args, ctx: DB) => {
        const { userId, subscriberId } = args;
        const subscriber = await ctx.users.findOne({
          key: "id",
          equals: subscriberId,
        });
        const user = await ctx.users.findOne({ key: "id", equals: userId });
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
          return await ctx.users.change(userId, { subscribedToUserIds });
        }
      },
    },
    unsubscribeFrom: {
      type: userType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        unsubId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args, ctx: DB) => {
        const { userId, unsubId } = args;
        const unsub = await ctx.users.findOne({
          key: "id",
          equals: unsubId,
        });
        console.log(unsub);
        const user = await ctx.users.findOne({ key: "id", equals: userId });
        console.log(user);
        if (user && unsub && user.subscribedToUserIds.includes(unsubId)) {
          console.log("ready to unsub");
          const subscribedToUserIds = user.subscribedToUserIds.filter(
            (id) => id !== unsubId
          );
          return ctx.users.change(userId, { subscribedToUserIds });
        }
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
});
