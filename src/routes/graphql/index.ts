import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { graphql } from "graphql";
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
      if (request.body.query) {
        console.log(request.body.query);
        return graphql({
          schema,
          source: request.body.query,
          contextValue: this.db,
        });
      }
      if (request.body.mutation)
        return graphql({ schema, source: request.body.mutation });
    }
  );
};

export default plugin;

const memberType: GraphQLObjectType = new GraphQLObjectType({
  name: "MemberType",
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    monthPostLimit: { type: new GraphQLNonNull(GraphQLInt) },
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
      resolve: (obj, args, ctx: DB) => {
        return ctx.users.findOne({ key: "id", equals: obj.userId });
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

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    profile: { type: profileType },
    memberType: { type: memberType },
    posts: {
      type: new GraphQLList(postType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.posts.findMany({ key: "userId", equals: obj.id });
      },
    },
    subscribedTo: { type: new GraphQLList(userType) },
    subscribedToUser: { type: new GraphQLList(userType) },
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
    memberType: { type: new GraphQLNonNull(memberType) },
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

export const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    memberTypes: {
      type: new GraphQLList(memberType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.memberTypes.findMany();
      },
    },
    users: {
      type: new GraphQLList(userType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.users.findMany();
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.posts.findMany();
      },
    },
    profiles: {
      type: new GraphQLList(profileType),
      resolve: (obj, args, ctx: DB) => {
        return ctx.profiles.findMany();
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
    deleteUser: {
      type: userType,
      args: {},
      async resolve(args) {
        return "";
      },
    },
    deleteProfile: {
      type: userType,
      args: {},
      async resolve(args) {
        return "";
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
});
