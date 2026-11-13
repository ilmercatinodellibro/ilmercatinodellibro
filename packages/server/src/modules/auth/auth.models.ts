import type { IncomingMessage } from "node:http";
import type { User } from "src/@generated/graphql";

export interface GraphQLContext {
  req: IncomingMessage & { body?: Record<string, string>; user: User };
}

export interface GraphQLConnectionParameters {
  authorization: string;
}

export interface GraphQLWebSocketExtra {
  authorizationHeader?: string;
  request: IncomingMessage;
}
