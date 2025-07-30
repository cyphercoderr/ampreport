import express from "express";
import dotenv from "dotenv";
import authRouter from "./routers/auth.router";
import propertyRouter from "./routers/property.router";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { initTRPC } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { createContext } from "./createContext";

const prisma = new PrismaClient();

const app = express();

dotenv.config();

app.use(cors());

const trpc = initTRPC.context<typeof createContext>().create();

const appRouter = trpc.router({
  auth: authRouter,
  property: propertyRouter,
});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(process.env.PORT, async () => {
  console.log("Server is Up and Running on port ", process.env.PORT);
  await prisma.$connect();
  console.log("Connected to the database successfully!");
});

export type AppRouter = typeof appRouter;
