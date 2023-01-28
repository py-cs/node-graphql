import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
} from "graphql";
import { PostEntity } from "../../../utils/DB/entities/DBPosts";
import { Context } from "./context";
import { UserType } from "./user";
import { GraphQLUUID } from "./uuid";

export const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLUUID },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: new GraphQLNonNull(UserType),
      resolve: (post: PostEntity, _args, ctx: Context) => {
        return ctx.userLoader.load(post.userId);
      },
    },
  }),
});

export const CreatePostType: GraphQLInputObjectType =
  new GraphQLInputObjectType({
    name: "CreatePostDTO",
    fields: () => ({
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
      userId: { type: new GraphQLNonNull(GraphQLUUID) },
    }),
  });

export const UpdatePostType: GraphQLInputObjectType =
  new GraphQLInputObjectType({
    name: "UpdatePostDTO",
    fields: () => ({
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    }),
  });
