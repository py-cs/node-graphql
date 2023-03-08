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
      resolve: async (_obj, _args, ctx) => {
        const memberTypes = await ctx.db.memberTypes.findMany();
        memberTypes.forEach((type) =>
          ctx.memberTypeLoader.prime(type.id, type)
        );
        return memberTypes;
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
      resolve: async (_obj, _args, ctx) => {
        const users = await ctx.db.users.findMany();
        users.forEach((user) => {
          ctx.userLoader.prime(user.id, user);
          ctx.subscriptionsByUserIdLoader.prime(
            user.id,
            users.filter((u) => u.subscribedToUserIds.includes(user.id))
          );
        });
        return users;
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
      resolve: async (_obj, _args, ctx) => {
        const posts = await ctx.db.posts.findMany();
        posts.forEach((post) => ctx.postLoader.prime(post.id, post));
        return posts;
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
      resolve: async (_obj, _args, ctx) => {
        const profiles = await ctx.db.profiles.findMany();
        profiles.forEach((profile) =>
          ctx.profileLoader.prime(profile.id, profile)
        );
        return profiles;
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
