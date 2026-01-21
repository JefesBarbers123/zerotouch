import { prisma } from './prisma'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
    const cookieStore = cookies()
    const userId = cookieStore.get('userId')?.value

    if (userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { tenant: true }
            })
            if (user) return user
        } catch (e) {
            console.error("Failed to get current user:", e)
            // Return null so layout doesn't crash
            return null
        }
    }

    // Fallback: If no cookie, try to find a default user (for dev convenience) 
    // OR return null to force login.
    // For V1 Polish, let's force login (or return null).
    return null
}

export async function getAllUsers() {
    // Helper to list users for the login screen
    // Returns all users in the system (since we are multi-tenant in a single DB, usually we'd filter by domain, but here show all)
    try {
        return await prisma.user.findMany({
            include: { tenant: true },
            orderBy: { name: 'asc' }
        })
    } catch (e) {
        console.error("Failed to get all users:", e)
        throw e // Re-throw so LoginPage can catch and display the specific error
    }
}
