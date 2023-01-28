import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
} from "graphql";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { Context } from "./context";
import { MemberType } from "./memberType";
import { UserType } from "./user";
import { GraphQLUUID } from "./uuid";

export const ProfileType: GraphQLObjectType = new GraphQLObjectType({
  name: "Profile",
  fields: () => ({
    id: { type: GraphQLUUID },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: new GraphQLNonNull(UserType) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (profile: ProfileEntity, _args, ctx: Context) => {
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
      birthday: { type: new GraphQLNonNull(GraphQLInt) },
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
      birthday: { type: GraphQLInt },
      country: { type: GraphQLString },
      street: { type: GraphQLString },
      city: { type: GraphQLString },
      userId: { type: GraphQLUUID },
      memberTypeId: { type: GraphQLString },
    }),
  });
