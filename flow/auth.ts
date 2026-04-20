import NextAuth from "next-auth"

export default NextAuth({
  providers: [
    {
      id: "blazeneuro",
      name: "BlazeNeuro",
      type: "oauth",
      authorization: {
        url: "https://auth.blazeneuro.com/oauth/v1/authorize",
        params: { scope: "openid profile email" }
      },
      token: {
        url: "https://auth.blazeneuro.com/oauth/v1/token",
        async request(context) {
          const { provider, params, checks } = context
          const response = await fetch(provider.token.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grant_type: "authorization_code",
              code: params.code,
              redirect_uri: provider.callbackUrl,
              client_id: provider.clientId,
              client_secret: provider.clientSecret,
            }),
          })
          const tokens = await response.json()
          return { tokens }
        },
      },
      userinfo: {
        url: "https://auth.blazeneuro.com/oauth/v1/userinfo",
        async request(context) {
          const response = await fetch("https://auth.blazeneuro.com/oauth/v1/userinfo", {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          })
          const userinfo = await response.json()
          console.log('[NextAuth] Userinfo received:', userinfo)
          return userinfo
        },
      },
      clientId: process.env.BLAZENEURO_CLIENT_ID,
      clientSecret: process.env.BLAZENEURO_CLIENT_SECRET,
      profile(profile) {
        console.log('[NextAuth] Profile mapping:', profile)
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
  },
})
