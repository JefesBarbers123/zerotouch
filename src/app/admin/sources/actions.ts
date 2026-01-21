
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addSource(formData: FormData) {
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const type = formData.get('type') as string;

    if (!name || !url || !type) return;

    try {
        await prisma.jobSource.create({
            data: { name, url, type, isActive: true },
        });
        revalidatePath('/admin/sources');
    } catch (error) {
        console.error('Failed to create source', error);
    }
}

export async function toggleSource(id: string, currentState: boolean, _formData?: FormData) {
    try {
        await prisma.jobSource.update({
            where: { id },
            data: { isActive: !currentState },
        });
        revalidatePath('/admin/sources');
    } catch (error) {
        console.error('Failed to update source', error);
    }
}

export async function deleteSource(id: string, _formData?: FormData) {
    try {
        await prisma.jobSource.delete({ where: { id } });
        revalidatePath('/admin/sources');
    } catch (error) {
        console.error('Failed to delete source', error);
    }
}
