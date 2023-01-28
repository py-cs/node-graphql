import { FastifyInstance } from "fastify/types/instance";
import { getLoaders } from "../loaders";

export type Context = ReturnType<typeof getLoaders> & {
  fastify: FastifyInstance;
};
