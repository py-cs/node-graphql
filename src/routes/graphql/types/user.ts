import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
} from "graphql";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { Context } from "./context";
import { PostType } from "./post";
import { ProfileType } from "./profile";
import { GraphQLUUID } from "./uuid";

export const UserType: GraphQLObjectType<UserEntity, Context> =
  new GraphQLObjectType({
    name: "User",
    fields: () => ({
      id: { type: GraphQLUUID },
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      subscribedToUserIds: {
        type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      },
      profile: {
        type: ProfileType,
        resolve: (user, _args, ctx) => {
          return ctx.profileByUserIdLoader.load(user.id);
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: async (user, _args, ctx) => {
          return await ctx.postsByAuthorIdLoader.load(user.id);
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve: async (user, _args, ctx) => {
          return await ctx.subscriptionsByUserIdLoader.load(user.id);
        },
      },
      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve: async (user, _args, ctx) => {
          return await ctx.userLoader.loadMany(user.subscribedToUserIds);
        },
      },
    }),
  });

export const CreateUserType: GraphQLInputObjectType =
  new GraphQLInputObjectType({
    name: "CreateUserDTO",
    fields: () => ({
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
    }),
  });

export const UpdateUserType: GraphQLInputObjectType =
  new GraphQLInputObjectType({
    name: "UpdateUserDTO",
    fields: () => ({
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
    }),
  });
