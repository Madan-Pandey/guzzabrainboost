import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Member } from "./User.interface"



export const credentialProvider = CredentialsProvider({
    name: 'guhuza',
    credentials: {
        userId: { label: "User ID", type: "text" },
        token: { label: "Token", type: "text" }
    },
    async authorize(credentials) {
        if (credentials?.userId && credentials?.token) {
            const response = await fetch(`${process.env.GUHUZA_API}/member/${credentials.userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${credentials.token}`
                },
            })
            const user = await response.json()
            if (response.ok && user) {
                return {
                    id: user.memberId,
                    memberId: user.memberId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.emailAddress,
                    name: user.firstName + " " + user.lastName
                };
            } else {
                return null
            }
        }
        return null
    },

})

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        credentialProvider
    ],
    callbacks: {
        session({ session, token }) {
            if (session.user) {
                session.user.email = token.email as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
                session.user.memberId = parseInt(token.id as string);
            }
            return session
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.firstName = (user as Member).firstName
                token.lastName = (user as Member).lastName
            }
            return token
        },
    },
})

