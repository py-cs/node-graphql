import { GraphQLObjectType, GraphQLList, GraphQLString } from "graphql";
import { Context } from "./types/context";
import { MemberType } from "./types/memberType";
import { PostType } from "./types/post";
import { ProfileType } from "./types/profile";
import { UserType } from "./types/user";
import { GraphQLUUID } from "./types/uuid";

export const RootQuery = new GraphQLObjectType<unknown, Context>({
  name: "RootQueryType",
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: (_obj, _args, ctx) => {
        return ctx.db.memberTypes.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_obj, args: { id: string }, ctx) => {
        return ctx.memberTypeLoader.load(args.id);
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: (_obj, _args, ctx) => {
        return ctx.db.users.findMany();
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLUUID },
      },
      resolve: (_obj, args: { id: string }, ctx) => {
        return ctx.userLoader.load(args.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (_obj, _args, ctx) => {
        return ctx.db.posts.findMany();
      },
    },
    post: {
      type: PostType,
      args: {
        id: { type: GraphQLUUID },
      },
      resolve: (_obj, args: { id: string }, ctx) => {
        return ctx.postLoader.load(args.id);
      },
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: (_obj, _args, ctx) => {
        return ctx.db.profiles.findMany();
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: GraphQLUUID },
      },
      resolve: (_obj, args: { id: string }, ctx) => {
        return ctx.profileLoader.load(args.id);
      },
    },
  },
});
