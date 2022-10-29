import {arg, enumType, extendType, idArg, inputObjectType, intArg, list, nonNull, objectType, stringArg} from "nexus";
import {Prisma} from "@prisma/client";

import {Context} from "../context";

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", {type: Sort});
        t.field("url", {type: Sort});
        t.field("createdAt", {type: Sort});
    },
});

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.nonNull.dateTime("createdAt");
        t.field("postedBy", {
            type: "User",
            resolve({id}, _, {prisma}) {
                return prisma.link
                    .findUnique({where: {id}})
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve({id}, _, {prisma}) {
                return prisma.link
                    .findUnique({where: {id}})
                    .voters();
            }
        });
    },
});

export const LinkQueries = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("links", {
            type: "Link",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({type: list(nonNull(LinkOrderByInput))}),
            },
            resolve(_, {filter, skip, take, orderBy}, {prisma}: Context) {
                const where = !filter ? {} : {
                    OR: [
                        {description: {contains: filter}},
                        {url: {contains: filter}}
                    ]
                };
                return prisma.link
                    .findMany({
                        where,
                        skip: skip as number | undefined,
                        take: take as number | undefined,
                        orderBy: orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,
                    });
            },
        });
        t.nullable.field("link", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },

            resolve(_, {id}, {prisma}: Context) {
                return prisma.link
                    .findUnique({where: {id: +id}})
                    .catch(() => {
                        throw new Error("Link not found");
                    });
            },
        });
    },
});

export const LinkMutations = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createLink", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(_, {description, url}, {prisma, userId}: Context) {
                if (!userId) {
                    throw new Error("Cannot post without loggin in.");
                }
                return prisma.link.create({
                    data: {description, url, postedBy: {connect: {id: userId}}}
                });
            },
        });
        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(idArg()),
                description: stringArg(),
                url: stringArg(),
            },
            resolve(_, {id, ...data}, {prisma, userId}: Context) {
                if (!userId) {
                    throw new Error("Cannot update post without loggin in.");
                }

                return prisma.link
                    .findFirst({
                        where: {id: +id, postedById: +userId}
                    }).then(() => prisma.link.update({
                        where: {id: +id},
                        data: data as any
                    })).catch(() => {
                        throw new Error("Link not found");
                    });
            },
        });
        t.nonNull.field("deleteLink", {
            type: "Link",
            args: {
                id: nonNull(idArg()),
            },
            resolve(_, {id}, {prisma, userId}: Context) {
                if (!userId) {
                    throw new Error("Cannot delete post without loggin in.");
                }
                return prisma.link
                    .findFirst({
                        where: {id: +id, postedById: +userId}
                    }).then(() => prisma.link.delete({
                        where: {id: +id}
                    })).catch(() => {
                        throw new Error("Link not found");
                    });
            },
        });
    },
});
