'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

export async function createManualJob(formData: FormData) {
    const user = await getCurrentUser()

    // Basic Auth Check
    if (!user || user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
        throw new Error("Unauthorized")
    }

    const title = formData.get('title') as string
    const company = formData.get('company') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const jobType = formData.get('jobType') as string
    const salaryMin = formData.get('salaryMin') ? parseFloat(formData.get('salaryMin') as string) : null
    const salaryMax = formData.get('salaryMax') ? parseFloat(formData.get('salaryMax') as string) : null
    const contactEmail = formData.get('contactEmail') as string
    const applicationUrl = formData.get('applicationUrl') as string

    if (!title || !company || !location || !description) {
        return { error: "Missing required fields" }
    }

    // Ensure MANUAL source exists
    let source = await prisma.jobSource.findFirst({
        where: { type: 'MANUAL', name: 'Manual Upload' }
    })

    if (!source) {
        source = await prisma.jobSource.create({
            data: {
                name: 'Manual Upload',
                type: 'MANUAL',
                url: 'INTERNAL',
                isActive: true
            }
        })
    }

    // Generate Slug & Fingerprint
    const baseSlug = `${title}-${company}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const random = crypto.randomBytes(3).toString('hex')
    const slug = `${baseSlug}-${random}`

    const fingerprint = crypto.createHash('md5')
        .update(`${title}|${company}|${location}|MANUAL-${Date.now()}`)
        .digest('hex')

    // Create Job
    await prisma.job.create({
        data: {
            title,
            company,
            location,
            description,
            jobType,
            salaryMin,
            salaryMax,
            contactEmail: contactEmail || null,
            sourceUrl: applicationUrl || `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${slug}`,
            slug,
            fingerprint,
            sourceId: source.id,
            postedDate: new Date(),
            isPublished: true,
            isFlagged: false
        }
    })

    redirect('/admin/jobs')
}
