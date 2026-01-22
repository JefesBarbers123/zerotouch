
import { prisma } from '@/lib/prisma';
import { deleteJob, toggleJobPublish } from './actions';
import Link from 'next/link';

export default async function JobsModerationPage({
    searchParams,
}: {
    searchParams: { page?: string; q?: string };
}) {
    const page = parseInt(searchParams.page || '1');
    const query = searchParams.q || '';
    const limit = 50;
    const skip = (page - 1) * limit;

    const where = query ? {
        OR: [
            { title: { contains: query } },
            { company: { contains: query } },
        ]
    } : {};

    const jobs = await prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: { source: true }
    });

    const total = await prisma.job.count({ where });

    return (
        <div className="p-8 text-white min-h-screen bg-neutral-900">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Job Moderation</h1>
                <div className="flex items-center gap-4">
                    <div className="text-neutral-400">Total: {total}</div>
                    <Link href="/admin/jobs/new" className="bg-amber-400 text-blue-950 font-black uppercase tracking-widest text-xs px-4 py-2 hover:bg-white transition-colors rounded">
                        + Post New Job
                    </Link>
                </div>
            </div>

            <form className="mb-8 flex gap-4">
                <input
                    name="q"
                    defaultValue={query}
                    placeholder="Search jobs..."
                    className="bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-lg text-white w-full max-w-md focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-lg">Search</button>
            </form>

            <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
                <table className="w-full text-left font-sans">
                    <thead className="bg-neutral-900 text-neutral-400 text-sm">
                        <tr>
                            <th className="p-4">Title / Company</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Posted</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-neutral-700/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-semibold text-neutral-200">{job.title}</div>
                                    <div className="text-sm text-neutral-400">{job.company} • {job.location}</div>
                                </td>
                                <td className="p-4 text-sm text-neutral-400">
                                    {job.source?.name || 'Manual Upload'}
                                </td>
                                <td className="p-4 text-sm text-neutral-400">
                                    {job.postedDate.toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${job.isPublished ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                        {job.isPublished ? 'Live' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <Link href={`/jobs/${job.slug}`} target="_blank" className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-xs text-center flex items-center">
                                        View
                                    </Link>
                                    <form action={toggleJobPublish.bind(null, job.id, job.isPublished)}>
                                        <button className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-xs min-w-[70px]">
                                            {job.isPublished ? 'Unpublish' : 'Publish'}
                                        </button>
                                    </form>
                                    <form action={deleteJob.bind(null, job.id)}>
                                        <button className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded text-xs">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {jobs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-neutral-500">No jobs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-center gap-4">
                {page > 1 && (
                    <Link href={`/admin/jobs?page=${page - 1}&q=${query}`} className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded">
                        Previous
                    </Link>
                )}
                {(page * limit) < total && (
                    <Link href={`/admin/jobs?page=${page + 1}&q=${query}`} className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded">
                        Next
                    </Link>
                )}
            </div>
        </div>
    );
}
