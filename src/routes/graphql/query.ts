import { GraphQLObjectType, GraphQLList, GraphQLString } from "graphql";
import { Entities, entityNotFoundMessage } from "./errors";
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
      resolve: async (_obj, args: { id: string }, ctx) => {
        const memberType = await ctx.memberTypeLoader.load(args.id);
        if (!memberType)
          throw new Error(entityNotFoundMessage(Entities.MEMBER_TYPE, args.id));
        return memberType;
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
      resolve: async (_obj, args: { id: string }, ctx) => {
        const user = await ctx.userLoader.load(args.id);
        if (!user)
          throw new Error(entityNotFoundMessage(Entities.USER, args.id));
        return user;
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
      resolve: async (_obj, args: { id: string }, ctx) => {
        const post = await ctx.postLoader.load(args.id);
        if (!post)
          throw new Error(entityNotFoundMessage(Entities.POST, args.id));
        return post;
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
      resolve: async (_obj, args: { id: string }, ctx) => {
        const profile = await ctx.profileLoader.load(args.id);
        if (!profile)
          throw new Error(entityNotFoundMessage(Entities.PROFILE, args.id));
        return profile;
      },
    },
  },
});
