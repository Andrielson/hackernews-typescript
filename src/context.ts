import {PrismaClient} from "@prisma/client";
import {Request} from "express";
import {decodeAuthHeader} from "./utils/auth";

export const prisma = new PrismaClient({
    rejectOnNotFound: true,
    log: ['query']
});

export interface Context {
    prisma: PrismaClient;
    userId?: number;
}

export const context = ({req}: {req: Request}): Context => {
    const { authorization } = req?.headers;
    const token = !!authorization ? decodeAuthHeader(authorization) : null;
    return {prisma, userId: Number(token?.sub)};
};