import prisma from "../config/prismaClient";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

const trpc = initTRPC.create();

export const propertyRouter = trpc.router({
  create: trpc.procedure
    .input(
      z.object({
        name: z.string().min(1, "Property name is required."),
        location: z.string().min(1, "Location is required."),
        units: z.number().min(1, "At least one unit is required."),
        additionalInfo: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, location, units, additionalInfo } = input;
      const token = ctx.req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No token provided.",
        });
      }

      try {
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        );
        const userId = decoded.id;

        const existingProperty = await prisma.property.findFirst({
          where: {
            location,
            userId: userId,
          },
        });

        if (existingProperty) {
          throw new TRPCError({
            code: "CONFLICT",
            message: JSON.stringify([
              {
                path: ["property"],
                message: "A property with the same location already exists.",
              },
            ]),
          });
        }

        const newProperty = await prisma.property.create({
          data: {
            name,
            location,
            units,
            additionalInfo,
            userId: userId,
          },
        });

        return {
          message: "Property created successfully!",
          property: newProperty,
        };
      } catch (err: any) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: err,
        });
      }
    }),

  getUserProperties: trpc.procedure.query(async ({ ctx }) => {
    const token = ctx.req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No token provided.",
      });
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const userId = decoded.id;

      const properties = await prisma.property.findMany({
        where: {
          userId: userId,
        },
      });

      return properties;
    } catch (err) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid token.",
      });
    }
  }),
});

export default propertyRouter;
