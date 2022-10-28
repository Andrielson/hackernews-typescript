import {extendType, idArg, nonNull, nullable, objectType, stringArg} from "nexus";
import {NexusGenObjects} from "../../nexus-typegen";
import {Context} from "../context";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    },
});

const links: NexusGenObjects["Link"][] = [
    {
        id: 1,
        url: "www.howtographql.com",
        description: "Fullstack tutorial for GraphQL"
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website"
    },
];

export const LinksQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("links", {
            type: "Link",
            resolve(parent, args, { prisma }: Context) {
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

            resolve(_, args) {
                const {id} = args;
                return links.find(it => it.id === +id)!;
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

            resolve(_, { description, url }, { prisma }: Context) {
                return prisma.link.create({
                    data: { description, url}
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
            resolve(_, args) {
                const {id, description, url} = args;
                const link = links.find(it => it.id === +id);
                if (!link) throw new Error("Link not found");
                if (description) link.description = description;
                if (url) link.url = url;
                return link;
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
            resolve(_, args) {
                const {id} = args;
                const index = links.findIndex(it => it.id === +id);
                if (index < 0) throw new Error("Link not found");
                const link = links[index];
                links.splice(index, 1);
                return link;
            },
        });
    },
});