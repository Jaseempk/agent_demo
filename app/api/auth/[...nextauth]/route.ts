import NextAuth, { DefaultSession, NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      address: string;
    } & DefaultSession["user"];
  }
}

interface EthereumUser extends User {
  address: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials: Record<"address", string> | undefined) {
        if (!credentials?.address) return null;
        return {
          id: credentials.address,
          address: credentials.address,
        } as EthereumUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = (user as EthereumUser).address;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.address = token.address as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
