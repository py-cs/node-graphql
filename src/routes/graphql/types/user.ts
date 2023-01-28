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

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLUUID },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    profile: {
      type: ProfileType,
      resolve: (user: UserEntity, _args, ctx: Context) => {
        return ctx.profileByUserIdLoader.load(user.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (user: UserEntity, _args, ctx: Context) => {
        return ctx.db.posts.findMany({
          key: "userId",
          equals: user.id,
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (user: UserEntity, _args, ctx: Context) => {
        return ctx.db.users.findMany({
          key: "subscribedToUserIds",
          inArray: user.id,
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (user: UserEntity, _args, ctx: Context) => {
        return ctx.db.users.findMany({
          key: "id",
          equalsAnyOf: user.subscribedToUserIds,
        });
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
