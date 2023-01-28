import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

import { isUUID } from "./isUUID";

export const GraphQLUUID = new GraphQLScalarType({
  name: "UUID",
  serialize: (value) => {
    if (typeof value !== "string" || !isUUID(value))
      throw new TypeError(`Invalid UUID`);
    return value.toLowerCase();
  },
  parseValue: (value) => {
    if (typeof value !== "string" || !isUUID(value))
      throw new TypeError(`Invalid UUID`);
    return value.toLowerCase();
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      if (isUUID(ast.value)) {
        return ast.value;
      }
    }

    return undefined;
  },
});
