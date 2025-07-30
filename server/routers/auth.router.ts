import prisma from "../config/prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const trpc = initTRPC.create();
const SALT_ROUNDS = 12;

const authRouter = trpc.router({
  signUp: trpc.procedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8).max(30),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: JSON.stringify([
            { path: ["email"], message: "Email already in use" },
          ]),
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),

  login: trpc.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: JSON.stringify([
            { path: ["email/password"], message: "Invalid email or password" },
          ]),
        });
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: JSON.stringify([
            { path: ["email/password"], message: "Invalid email or password" },
          ]),
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),
});

export default authRouter;
