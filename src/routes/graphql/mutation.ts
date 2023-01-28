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
        return ctx.db.users.create(args.createUserDTO);
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        createProfileDTO: { type: CreateProfileType },
      },
      async resolve(_, args, ctx: Context) {
        const user = await ctx.userLoader.load(args.createProfileDTO.userId);
        if (!user)
          throw new Error("Bad request, user with this id does not exist");

        const memberType = await ctx.memberTypeLoader.load(
          args.createProfileDTO.memberTypeId
        );
        if (!memberType) throw new Error("Bad request, invalid member type");

        return ctx.db.profiles.create(args.createProfileDTO);
      },
    },
    createPost: {
      type: PostType,
      args: {
        createPostDTO: { type: CreatePostType },
      },
      async resolve(_, args, ctx: Context) {
        const user = await ctx.userLoader.load(args.createPostDTO.userId);
        if (!user)
          throw new Error("Bad request, user with this id does not exist");

        return ctx.db.posts.create(args.createPostDTO);
      },
    },
    updateMemberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        updateMemberTypeDTO: { type: UpdateMemberType },
      },
      async resolve(_, args, ctx: Context) {
        const updated = await ctx.db.memberTypes.change(
          args.id,
          args.updateMemberTypeDTO
        );
        if (!updated) throw new Error("Bad request");

        return updated;
      },
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updatePostDTO: { type: UpdatePostType },
      },
      async resolve(_, args, ctx: Context) {
        const updated = await ctx.db.posts.change(args.id, args.updatePostDTO);
        if (!updated) throw new Error("Bad request");

        return updated;
      },
    },
    updateProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateProfileDTO: { type: UpdateProfileType },
      },
      async resolve(_, args, ctx: Context) {
        const updated = await ctx.db.profiles.change(
          args.id,
          args.updateProfileDTO
        );
        if (!updated) throw new Error("Bad request");

        return updated;
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateUserDTO: { type: UpdateUserType },
      },
      async resolve(_, args, ctx: Context) {
        const updated = await ctx.db.users.change(args.id, args.updateUserDTO);
        if (!updated) throw new Error("Bad request");

        return updated;
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
          return await ctx.db.users.change(userId, {
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
          return ctx.db.users.change(userId, { subscribedToUserIds });
        }
      },
    },
  },
});
