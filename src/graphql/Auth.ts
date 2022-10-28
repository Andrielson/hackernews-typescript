import {randomUUID} from "crypto";
import {extendType, nonNull, objectType, stringArg} from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import {APP_SECRET} from "../utils/auth";

export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.string("token");
        t.nonNull.field("user", {
            type: "User",
        });
    },
});

export const AuthMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("login", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(_, {email, password}, {prisma}) {
                const user = await prisma.user.findUnique({where: {email}});
                if (!user) {
                    throw new Error("No such user found");
                }

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    throw new Error("Invalid password");
                }

                const token = jwt.sign({userId: user.id}, APP_SECRET);

                return {token, user};
            },
        });

        t.nonNull.field("signup", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
                name: nonNull(stringArg())
            },
            async resolve(_, args, {prisma}) {
                const {email, name} = args;
                const password = await bcrypt.hash(args.password, 10);
                const user = await prisma.user.create({data: {email, name, password}});

                const now = new Date();
                const tokenPayload: jwt.JwtPayload = {
                    iat: now.getTime(),
                    jti: randomUUID(),
                    sub: String(user.id),
                    exp: now.setMinutes(now.getMinutes() + 30),
                };

                const token = jwt.sign(tokenPayload, APP_SECRET);

                return {token, user};
            }
        });
    },
});