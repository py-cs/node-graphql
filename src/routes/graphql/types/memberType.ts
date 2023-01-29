import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLInt,
  GraphQLInputObjectType,
} from "graphql";
import { MemberTypeEntity } from "../../../utils/DB/entities/DBMemberTypes";

export const MemberType = new GraphQLObjectType<MemberTypeEntity>({
  name: "MemberType",
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const UpdateMemberType: GraphQLInputObjectType =
  new GraphQLInputObjectType({
    name: "UpdateMemberTypeDTO",
    fields: () => ({
      discount: { type: GraphQLFloat },
      monthPostsLimit: { type: GraphQLInt },
    }),
  });
