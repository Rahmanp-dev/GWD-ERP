import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/mongodb"

let authRes: any;
try {
    authRes = NextAuth({
        ...authConfig,
        adapter: MongoDBAdapter(clientPromise),
        session: { strategy: "jwt" },
        providers: [
            Credentials({
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                authorize: async (credentials) => {
                    const { default: dbConnect } = await import("./lib/db");
                    await dbConnect();

                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const { default: User } = await import("./lib/models/User");
                    const user = await User.findOne({ email: credentials.email });

                    if (!user) {
                        return null;
                    }

                    const { default: bcrypt } = await import("bcryptjs");
                    const isMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    if (!isMatch) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                },
            }),
        ],
    });
} catch (e) {
    console.error("NextAuth initialization failed (Build mode?)", e);
    authRes = {
        handlers: { GET: async () => new Response("Build Error"), POST: async () => new Response("Build Error") },
        auth: async () => null,
        signIn: async () => { },
        signOut: async () => { },
    };
}

export const { handlers, auth, signIn, signOut } = authRes;
