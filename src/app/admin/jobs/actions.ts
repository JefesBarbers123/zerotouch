
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleJobPublish(id: string, currentState: boolean, _formData?: FormData) {
    try {
        await prisma.job.update({
            where: { id },
            data: { isPublished: !currentState },
        });
        revalidatePath('/admin/jobs');
        revalidatePath('/jobs');
    } catch (error) {
        console.error('Failed to update job', error);
    }
}

export async function deleteJob(id: string, _formData?: FormData) {
    try {
        await prisma.job.delete({ where: { id } });
        revalidatePath('/admin/jobs');
        revalidatePath('/jobs');
    } catch (error) {
        console.error('Failed to delete job', error);
    }
}
