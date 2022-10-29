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
            }
        });
    },
});