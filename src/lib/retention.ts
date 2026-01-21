import { prisma } from './prisma'
import { sendSMS, TEMPLATES } from './sms'

// Configuration
const DEFAULT_CYCLE_DAYS = 28
const OVERDUE_THRESHOLD_DAYS = 7 // Days after expected return to become OVERDUE
const CHURN_THRESHOLD_DAYS = 90  // Days after expected return to become CHURNED

export async function calculateRetentionStatus(tenantId: string) {
    // 0. Get Tenant Settings
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { retentionSmsEnabled: true }
    })

    // 1. Get all clients for tenant
    const clients = await prisma.client.findMany({
        where: { tenantId },
        select: {
            id: true,
            lastVisitDate: true,
            expectedReturnDate: true,
            status: true,
            name: true,
            mobile: true
        }
    })

    const results = {
        processed: 0,
        updated: 0,
        details: [] as string[]
    }

    const today = new Date()

    for (const client of clients) {
        results.processed++

        // If never visited, they are NEW (or lost if created long ago? Stick to NEW for now)
        if (!client.lastVisitDate) continue

        // Determine Expected Return (if not set, default to last visit + cycle)
        // In a real app, this might be dynamic based on client avg.
        let expectedReturn = client.expectedReturnDate
        if (!expectedReturn) {
            expectedReturn = new Date(client.lastVisitDate)
            expectedReturn.setDate(expectedReturn.getDate() + DEFAULT_CYCLE_DAYS)
        }

        // Calculate Days Overdue (Today - Expected)
        const diffTime = today.getTime() - expectedReturn.getTime()
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        let newStatus = 'ACTIVE'

        if (daysOverdue >= CHURN_THRESHOLD_DAYS) {
            newStatus = 'CHURNED'
        } else if (daysOverdue >= OVERDUE_THRESHOLD_DAYS) {
            newStatus = 'OVERDUE' // > 7 days late
        } else if (daysOverdue >= 0) {
            newStatus = 'DUE'     // 0 to 7 days late
        } else {
            newStatus = 'ACTIVE'  // Not yet due
        }

        // Only update if status changed
        if (newStatus !== client.status) {
            await prisma.client.update({
                where: { id: client.id },
                data: { status: newStatus }
            })
            results.updated++
            results.details.push(`Updated ${client.name} from ${client.status} to ${newStatus}`)

            // Auto-Send SMS logic (Check Toggle)
            if (tenant?.retentionSmsEnabled && (newStatus === 'OVERDUE' || newStatus === 'CHURNED' || newStatus === 'DUE') && client.mobile) {
                let template = ''
                if (newStatus === 'DUE') template = TEMPLATES.DUE
                if (newStatus === 'OVERDUE') template = TEMPLATES.OVERDUE
                if (newStatus === 'CHURNED') template = TEMPLATES.CHURN_WINBACK

                if (template) {
                    const body = template.replace('{name}', client.name.split(' ')[0])

                    // Send SMS
                    const sent = await sendSMS({ to: client.mobile, body })

                    if (sent.success) {
                        // Log to DB
                        await prisma.message.create({
                            data: {
                                clientId: client.id,
                                content: body,
                                status: 'SENT',
                                direction: 'OUTBOUND'
                            }
                        })
                        results.details.push(`- Sent SMS: "${body}"`)
                    } else {
                        results.details.push(`- Failed to send SMS: ${sent.error}`)
                    }
                }
            }
        }
    }

    return results
}

// Logic to run daily
export async function runDailyRetentionJob() {
    // Iterate all tenants in a real worker
    // For V1, just getting the first/demo tenant
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) return

    console.log(`Running Retention Job for ${tenant.name}...`)
    const res = await calculateRetentionStatus(tenant.id)
    console.log('Retention Job Complete:', res)
    return res
}
