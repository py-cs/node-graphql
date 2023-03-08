import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLFloat,
} from "graphql";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { Context } from "./context";
import { MemberType } from "./memberType";
import { UserType } from "./user";
import { GraphQLUUID } from "./uuid";

export const ProfileType = new GraphQLObjectType<ProfileEntity, Context>({
  name: "Profile",
  fields: () => ({
    id: { type: GraphQLUUID },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLFloat) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLUUID) },
    user: {
      type: new GraphQLNonNull(UserType),
      resolve: async (profile, _args, ctx) => {
        return ctx.userLoader.load(profile.userId);
      },
    },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (profile, _args, ctx) => {
        return ctx.memberTypeLoader.load(profile.memberTypeId);
      },
    },
  }),
});

export const CreateProfileType: GraphQLInputObjectType =
  new GraphQLInputObjectType({
    name: "CreateProfileDTO",
    fields: () => ({
      avatar: { type: new GraphQLNonNull(GraphQLString) },
      sex: { type: new GraphQLNonNull(GraphQLString) },
      birthday: { type: new GraphQLNonNull(GraphQLFloat) },
      country: { type: new GraphQLNonNull(GraphQLString) },
      street: { type: new GraphQLNonNull(GraphQLString) },
      city: { type: new GraphQLNonNull(GraphQLString) },
      userId: { type: new GraphQLNonNull(GraphQLUUID) },
      memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    }),
  });

export const UpdateProfileType: GraphQLInputObjectType =
  new GraphQLInputObjectType({
    name: "UpdateProfileDTO",
    fields: () => ({
      avatar: { type: GraphQLString },
      sex: { type: GraphQLString },
      birthday: { type: GraphQLFloat },
      country: { type: GraphQLString },
      street: { type: GraphQLString },
      city: { type: GraphQLString },
      memberTypeId: { type: GraphQLString },
    }),
  });
