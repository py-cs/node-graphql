import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from "graphql";
import { Context } from "./types/context";
import { MemberType, UpdateMemberType } from "./types/memberType";
import { PostType, CreatePostType, UpdatePostType } from "./types/post";
import {
  ProfileType,
  CreateProfileType,
  UpdateProfileType,
} from "./types/profile";
import { UserType, CreateUserType, UpdateUserType } from "./types/user";
import { GraphQLUUID } from "./types/uuid";

export const Mutations = new GraphQLObjectType({
  name: "Mutations",
  fields: {
    createUser: {
      type: UserType,
      args: {
        createUserDTO: { type: CreateUserType },
      },
      async resolve(_, args, ctx: Context) {
        return ctx.fastify.db.users.create(args.createUserDTO);
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        createProfileDTO: { type: CreateProfileType },
      },
      async resolve(_, args, ctx: Context) {
        const user = await ctx.userLoader.load(args.createProfileDTO.userId);
        if (!user) throw ctx.fastify.httpErrors.badRequest("User not found");

        const memberType = await ctx.memberTypeLoader.load(
          args.createProfileDTO.memberTypeId
        );
        if (!memberType)
          throw ctx.fastify.httpErrors.badRequest("Member type not found");

        return ctx.fastify.db.profiles.create(args.createProfileDTO);
      },
    },
    createPost: {
      type: PostType,
      args: {
        createPostDTO: { type: CreatePostType },
      },
      async resolve(_, args, ctx: Context) {
        const user = await ctx.userLoader.load(args.createPostDTO.userId);
        if (!user) throw ctx.fastify.httpErrors.badRequest("User not found");

        return ctx.fastify.db.posts.create(args.createPostDTO);
      },
    },
    updateMemberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        updateMemberTypeDTO: { type: UpdateMemberType },
      },
      async resolve(_, args, ctx: Context) {
        return ctx.fastify.db.memberTypes.change(
          args.id,
          args.updateMemberTypeDTO
        );
      },
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updatePostDTO: { type: UpdatePostType },
      },
      async resolve(_, args, ctx: Context) {
        return ctx.fastify.db.posts.change(args.id, args.updatePostDTO);
      },
    },
    updateProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateProfileDTO: { type: UpdateProfileType },
      },
      async resolve(_, args, ctx: Context) {
        return ctx.fastify.db.profiles.change(args.id, args.updateProfileDTO);
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateUserDTO: { type: UpdateUserType },
      },
      async resolve(_, args, ctx: Context) {
        return ctx.fastify.db.users.change(args.id, args.updateUserDTO);
      },
    },
    subscribeTo: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLUUID) },
        subscriberId: { type: new GraphQLNonNull(GraphQLUUID) },
      },
      resolve: async (_, args, ctx: Context) => {
        const { userId, subscriberId } = args;
        const user = await ctx.userLoader.load(userId);
        const subscriber = await ctx.userLoader.load(subscriberId);
        if (
          user &&
          subscriber &&
          !user.subscribedToUserIds.includes(subscriberId)
        ) {
          const subscribedToUserIds = [
            ...user.subscribedToUserIds,
            subscriberId,
          ];
          return await ctx.fastify.db.users.change(userId, {
            subscribedToUserIds,
          });
        }
      },
    },
    unsubscribeFrom: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLUUID) },
        unsubId: { type: new GraphQLNonNull(GraphQLUUID) },
      },
      resolve: async (_, args, ctx: Context) => {
        const { userId, unsubId } = args;
        const user = await ctx.userLoader.load(userId);
        const unsub = await ctx.userLoader.load(unsubId);

        if (user && unsub && user.subscribedToUserIds.includes(unsubId)) {
          const subscribedToUserIds = user.subscribedToUserIds.filter(
            (id) => id !== unsubId
          );
          return ctx.fastify.db.users.change(userId, { subscribedToUserIds });
        }
      },
    },
  },
});
