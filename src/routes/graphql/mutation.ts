import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from "graphql";
import { Entities, entityNotFoundMessage, Errors } from "./errors";
import { filterDTO } from "./filterDTO";
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
        const { userId, memberTypeId } = args.createProfileDTO;

        const user = await ctx.userLoader.load(userId);
        if (!user)
          throw new Error(entityNotFoundMessage(Entities.USER, userId));

        const profile = await ctx.profileByUserIdLoader.load(
          args.createProfileDTO.userId
        );
        if (profile) throw new Error(Errors.HAS_PROFILE);

        const memberType = await ctx.memberTypeLoader.load(
          args.createProfileDTO.memberTypeId
        );
        if (!memberType)
          throw new Error(
            entityNotFoundMessage(Entities.MEMBER_TYPE, memberTypeId)
          );

        return ctx.db.profiles.create(args.createProfileDTO);
      },
    },
    createPost: {
      type: PostType,
      args: {
        createPostDTO: { type: CreatePostType },
      },
      async resolve(_, args, ctx: Context) {
        const { userId } = args.createPostDTO;
        const user = await ctx.userLoader.load(userId);
        if (!user)
          throw new Error(entityNotFoundMessage(Entities.USER, userId));

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
        try {
          const updated = await ctx.db.memberTypes.change(
            args.id,
            filterDTO(args.updateMemberTypeDTO)
          );
          return updated;
        } catch {
          throw new Error(entityNotFoundMessage(Entities.MEMBER_TYPE, args.id));
        }
      },
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updatePostDTO: { type: UpdatePostType },
      },
      async resolve(_, args, ctx: Context) {
        try {
          return await ctx.db.posts.change(
            args.id,
            filterDTO(args.updatePostDTO)
          );
        } catch {
          throw new Error(entityNotFoundMessage(Entities.POST, args.id));
        }
      },
    },
    updateProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateProfileDTO: { type: UpdateProfileType },
      },
      async resolve(_, args, ctx: Context) {
        const { memberTypeId } = args.updateProfileDTO;
        if (memberTypeId) {
          const newMemberType = await ctx.memberTypeLoader.load(memberTypeId);

          if (!newMemberType)
            throw new Error(
              entityNotFoundMessage(Entities.MEMBER_TYPE, memberTypeId)
            );
        }

        try {
          return await ctx.db.profiles.change(
            args.id,
            filterDTO(args.updateProfileDTO)
          );
        } catch {
          throw new Error(entityNotFoundMessage(Entities.PROFILE, args.id));
        }
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLUUID) },
        updateUserDTO: { type: UpdateUserType },
      },
      async resolve(_, args, ctx: Context) {
        try {
          return await ctx.db.users.change(
            args.id,
            filterDTO(args.updateUserDTO)
          );
        } catch {
          throw new Error(entityNotFoundMessage(Entities.USER, args.id));
        }
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
        if (userId === subscriberId) throw new Error(Errors.SELF_SUBSCRIBE);

        const user = await ctx.userLoader.load(userId);
        if (!user)
          throw new Error(entityNotFoundMessage(Entities.USER, userId));

        const subscriber = await ctx.userLoader.load(subscriberId);
        if (!subscriber)
          throw new Error(entityNotFoundMessage(Entities.USER, subscriberId));

        if (user.subscribedToUserIds.includes(subscriberId))
          throw new Error(Errors.ALREADY_SUBSCRIBED);
        const subscribedToUserIds = [...user.subscribedToUserIds, subscriberId];
        return await ctx.db.users.change(userId, {
          subscribedToUserIds,
        });
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
        if (!user)
          throw new Error(entityNotFoundMessage(Entities.USER, userId));
        const unsub = await ctx.userLoader.load(unsubId);
        if (!unsub)
          throw new Error(entityNotFoundMessage(Entities.USER, unsubId));

        if (!user.subscribedToUserIds.includes(unsubId))
          throw new Error(Errors.NO_SUBSCRIPTION);
        const subscribedToUserIds = user.subscribedToUserIds.filter(
          (id) => id !== unsubId
        );
        return ctx.db.users.change(userId, { subscribedToUserIds });
      },
    },
  },
});
