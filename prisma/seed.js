
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    try {
        // Clean up existing data (optional, but good for idempotency if we reset)
        // Note: Order matters due to foreign keys
        await prisma.message.deleteMany()
        await prisma.visit.deleteMany()
        await prisma.client.deleteMany()
        await prisma.service.deleteMany()
        await prisma.user.deleteMany()
        await prisma.tenant.deleteMany()

        // 1. Create Tenant
        const tenant = await prisma.tenant.create({
            data: {
                name: 'Blade & Fades',
            },
        })
        console.log('Created Tenant:', tenant.name)

        // 2. Create Users
        const owner = await prisma.user.create({
            data: {
                email: 'owner@bladefades.com',
                name: 'Mario (Owner)',
                role: 'OWNER',
                tenantId: tenant.id,
            },
        })

        const barber = await prisma.user.create({
            data: {
                email: 'luigi@bladefades.com',
                name: 'Luigi (Barber)',
                role: 'BARBER',
                tenantId: tenant.id,
            },
        })

        // 3. Create Services
        const cut = await prisma.service.create({
            data: {
                name: 'Skin Fade',
                duration: 45,
                price: 40.00,
                tenantId: tenant.id,
            },
        })

        const beard = await prisma.service.create({
            data: {
                name: 'Beard Trim',
                duration: 15,
                price: 20.00,
                tenantId: tenant.id,
            },
        })

        // 4. Create Clients and Visits to test Retention Logic
        const today = new Date()

        // Helper to get date N days ago
        const daysAgo = (n) => {
            const d = new Date()
            d.setDate(today.getDate() - n)
            return d
        }

        // Client 1: Active (Visited 2 weeks ago)
        const activeClient = await prisma.client.create({
            data: {
                name: 'Active Aaron',
                mobile: '+15550001',
                tenantId: tenant.id,
                status: 'ACTIVE',
                lastVisitDate: daysAgo(14),
                visits: {
                    create: {
                        date: daysAgo(14),
                        barberId: barber.id,
                        serviceId: cut.id,
                        tenantId: tenant.id,
                    }
                }
            }
        })

        // Client 2: Due (Visited 4 weeks ago) - Assuming 4 week cycle
        const dueClient = await prisma.client.create({
            data: {
                name: 'Due Dave',
                mobile: '+15550002',
                tenantId: tenant.id,
                status: 'DUE', // This would normally be calculated, but seeding state for UI
                lastVisitDate: daysAgo(28),
                visits: {
                    create: {
                        date: daysAgo(28),
                        barberId: owner.id,
                        serviceId: cut.id,
                        tenantId: tenant.id,
                    }
                }
            }
        })

        // Client 3: Overdue (Visited 6 weeks ago)
        const overdueClient = await prisma.client.create({
            data: {
                name: 'Overdue Ollie',
                mobile: '+15550003',
                tenantId: tenant.id,
                status: 'OVERDUE',
                lastVisitDate: daysAgo(42),
                visits: {
                    create: {
                        date: daysAgo(42),
                        barberId: barber.id,
                        serviceId: cut.id,
                        tenantId: tenant.id,
                    }
                }
            }
        })

        // Client 4: Churned (Visited 12 weeks ago)
        const churnedClient = await prisma.client.create({
            data: {
                name: 'Churned Charlie',
                mobile: '+15550004',
                tenantId: tenant.id,
                status: 'CHURNED',
                lastVisitDate: daysAgo(90),
                visits: {
                    create: {
                        date: daysAgo(90),
                        barberId: owner.id,
                        serviceId: cut.id,
                        tenantId: tenant.id,
                    }
                }
            }
        })

        // Client 5: New (No visits)
        const newClient = await prisma.client.create({
            data: {
                name: 'New Ned',
                mobile: '+15550005',
                tenantId: tenant.id,
                status: 'NEW',
            }
        })

        console.log('Seeding finished.')
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
