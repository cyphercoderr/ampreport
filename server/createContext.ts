import { type inferAsyncReturnType } from "@trpc/server";
import { type Request } from "express";

export const createContext = ({ req }: { req: Request }) => {
  return {
    req,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
