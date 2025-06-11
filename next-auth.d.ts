import NextAuth from 'next-auth';
import { Member } from './User.interface';

declare module 'next-auth' {
    interface Session extends NextAuth.Session {
        user?: Member
        error?: string | null
    }
}