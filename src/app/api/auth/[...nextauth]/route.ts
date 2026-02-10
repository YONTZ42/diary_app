import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// バックエンドのURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.3.4:8080/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
console.log("--- Login Attempt Start ---");
  console.log("Credentials:", credentials?.email);
  console.log("Backend URL:", API_BASE_URL);
        try {
          // DjangoのJWT発行エンドポイントを叩く
          // ※ Django側で `SimpleJWT` の `TokenObtainPairView` が設定されている前提
          const res = await fetch(`${API_BASE_URL}/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // data = { access: "...", refresh: "..." }
            
            // ユーザー情報を返す（これがsessionに入る）
            // JWTのペイロードをデコードしてIDなどを取り出すのが一般的だが、
            // ここでは簡易的にアクセストークンを持たせる
            return {
              id: "user-id-placeholder", // 本来はJWTから取り出す
              email: credentials.email,
              accessToken: data.access,
              refreshToken: data.refresh,
            };
          }
          return null;
        } catch (e) {
          console.error(e);
          return null;
        }
      }
    })
  ],
// 1. セッションの設定（コールバックの外側に置く）
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  callbacks: {
    // 2. JWTコールバック
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    // 3. セッションコールバック（ここには strategy は書かない）
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    }
  },
  pages: {
    signIn: '/login', // カスタムログインページ
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };