import type { IncomingMessage } from "node:http";
import type { User } from "src/@generated";

export interface GraphQLContext {
  req: IncomingMessage & { body?: Record<string, string>; user: User };
}

export interface GraphQLConnectionParams {
  authorization: string;
}

export interface GraphQLWebSocketExtra {
  authorizationHeader?: string;
  request: IncomingMessage;
}
