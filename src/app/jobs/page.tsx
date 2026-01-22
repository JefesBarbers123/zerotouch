
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Barber Jobs | Find Your Next Role',
    description: 'Browse the latest barber jobs, apprenticeships, and salon vacancies across the UK.',
};

export const revalidate = 3600;

export default async function JobsPage({
    searchParams,
}: {
    searchParams: { q?: string; l?: string };
}) {
    const query = searchParams.q || '';
    const location = searchParams.l || '';

    const jobs = await prisma.job.findMany({
        where: {
            isPublished: true,
            AND: [
                {
                    OR: [
                        { expiryDate: { gt: new Date() } },
                        { expiryDate: null }
                    ]
                },
                query ? {
                    OR: [
                        { title: { contains: query } },
                        { description: { contains: query } },
                        { company: { contains: query } }
                    ]
                } : {},
                location ? { location: { contains: location } } : {},
            ]
        },
        orderBy: { postedDate: 'desc' },
        take: 50,
    });

    return (
        <div className="min-h-screen bg-blue-950 text-white p-6 md:p-12 font-sans selection:bg-amber-400 selection:text-blue-950">
            <div className="max-w-[1600px] mx-auto w-full">
                <header className="mb-12 text-center border-b-2 border-amber-400 pb-8">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        Job Board
                    </h1>
                    <p className="font-mono text-amber-400 text-sm md:text-base uppercase tracking-widest">
                        Curated opportunities for barbers and shops.
                    </p>
                </header>

                {/* Search Form */}
                <form className="mb-12 bg-blue-900/50 p-6 border-2 border-amber-400 flex flex-col md:flex-row gap-4 shadow-[8px_8px_0px_0px_#1e3a8a]" action="/jobs">
                    <input
                        type="text"
                        name="q"
                        placeholder="JOB TITLE, KEYWORDS..."
                        defaultValue={query}
                        className="flex-1 bg-blue-950 border-2 border-amber-400/30 p-4 font-bold uppercase tracking-wider text-white placeholder-blue-700 outline-none focus:border-amber-400 focus:bg-blue-900 transition-all"
                    />
                    <input
                        type="text"
                        name="l"
                        placeholder="LOCATION"
                        defaultValue={location}
                        className="flex-1 bg-blue-950 border-2 border-amber-400/30 p-4 font-bold uppercase tracking-wider text-white placeholder-blue-700 outline-none focus:border-amber-400 focus:bg-blue-900 transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-amber-400 hover:bg-amber-300 text-blue-950 font-black uppercase tracking-widest py-4 px-8 border-2 border-amber-400 hover:shadow-[4px_4px_0px_0px_#fff] transition-all transform active:translate-y-1"
                    >
                        Search
                    </button>
                </form>

                {/* Job List */}
                <div className="space-y-4">
                    {jobs.length === 0 ? (
                        <div className="text-center py-20 text-blue-500 font-mono text-sm uppercase tracking-widest border-2 border-dashed border-blue-900">
                            <p>No jobs found matching your criteria.</p>
                        </div>
                    ) : (
                        jobs.map((job) => (
                            <Link key={job.id} href={`/jobs/${job.slug}`} className="block group">
                                <article className="bg-blue-900/30 hover:bg-blue-900 border-2 border-amber-400/20 hover:border-amber-400 p-6 transition-all duration-300 relative overflow-hidden group-hover:shadow-[8px_8px_0px_0px_#fbbf24]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white group-hover:text-amber-400 transition-colors">
                                            {job.title}
                                        </h2>
                                        <span className="font-mono text-xs font-bold text-blue-950 bg-amber-400 px-3 py-1 uppercase">
                                            {job.postedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold uppercase tracking-wide text-blue-300 mb-4">
                                        <span className="flex items-center gap-2">
                                            {job.company}
                                        </span>
                                        <span className="flex items-center gap-2 text-amber-400/70">
                                            📍 {job.location}
                                        </span>
                                        {job.salaryMin && (
                                            <span className="flex items-center gap-2 text-green-400">
                                                💰 {job.currency || '£'}{job.salaryMin}{job.salaryMax ? ` - ${job.currency || '£'}${job.salaryMax}` : '+'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="inline-block text-xs font-mono font-bold text-amber-400 border-b-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        VIEW DETAILS &rarr;
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
