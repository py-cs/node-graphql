import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLInt,
  GraphQLInputObjectType,
} from "graphql";

export const MemberType: GraphQLObjectType = new GraphQLObjectType({
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
