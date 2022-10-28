import {extendType, idArg, nonNull, nullable, objectType, stringArg} from "nexus";
import {Context} from "../context";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    },
});

export const LinksQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("links", {
            type: "Link",
            resolve(_, args, {prisma}: Context) {
                return prisma.link.findMany();
            },
        });
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nullable.field("link", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },

            resolve(_, {id}, {prisma}: Context) {
                return prisma.link.findUnique({where: {id: +id}});
            },
        });
    },
});

export const CreateLinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createLink", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(_, {description, url}, {prisma}: Context) {
                return prisma.link.create({
                    data: {description, url}
                });
            },
        });
    },
});

export const UpdateLinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(idArg()),
                description: nullable(stringArg()),
                url: nullable(stringArg()),
            },
            resolve(_, {id, ...data}, {prisma}: Context) {
                return prisma.link.update({
                    where: {id: +id},
                    data: data as any
                }).catch(() => {
                    throw new Error("Link not found");
                });
            },
        });
    },
});

export const DeleteLinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("deleteLink", {
            type: "Link",
            args: {
                id: nonNull(idArg()),
            },
            resolve(_, {id}, {prisma}: Context) {
                return prisma.link.delete({where: {id: +id}})
                    .catch(() => {
                        throw new Error("Link not found");
                    });
            },
        });
    },
});