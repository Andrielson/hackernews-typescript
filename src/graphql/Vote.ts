import {User} from "@prisma/client";
import {extendType, intArg, nonNull, objectType} from "nexus";

export const Vote = objectType({
    name: "Vote",
    definition(t) {
        t.nonNull.field("link", {type: "Link"});
        t.nonNull.field("user", {type: "User"});
    },
});

export const VoteMutations = extendType({
    type: "Mutation",
    definition(t) {
        t.field("vote", {
            type: "Vote",
            args: {
                linkId: nonNull(intArg()),
            },
            async resolve(_, {linkId}, {prisma, userId}) {
                if (!userId) {
                    throw new Error("Cannot vote without logging in.");
                }

                const link = await prisma.link.update({
                    where: {
                        id: linkId
                    },
                    data: {
                        voters: {
                            connect: {
                                id: userId
                            }
                        }
                    },
                });

                const user = await prisma.user.findUnique({where: {id: userId}}) as User;

                return {link, user};
            },
        });
    },
});