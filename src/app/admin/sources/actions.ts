
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { IngestionManager } from '@/lib/ingestion/manager';

export async function refreshSource(id: string, _formData?: FormData) {
    try {
        const manager = new IngestionManager();
        await manager.processSource(id);
        revalidatePath('/admin/sources');
    } catch (error) {
        console.error('Failed to refresh source', error);
    }
}

export async function addSource(formData: FormData) {
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const type = formData.get('type') as string;
    const selectorsRaw = formData.get('selectors') as string;

    if (!name || !url || !type) return;

    let selectors = null;
    if (selectorsRaw && type === 'SCRAPER') {
        try {
            selectors = JSON.parse(selectorsRaw);
        } catch (e) {
            console.error('Invalid JSON for selectors');
            // Allow creation but log error? Or fail? 
            // Better to fail or ignore invalid config.
        }
    }

    try {
        await prisma.jobSource.create({
            data: {
                name,
                url,
                type,
                isActive: true,
                selectors: (selectors || undefined) as any
            },
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
