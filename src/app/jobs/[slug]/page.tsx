
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ReportButton } from './report-button';
import { ApplyButton } from './apply-button';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const job = await prisma.job.findUnique({
        where: { slug: params.slug },
    });

    if (!job) return { title: 'Job Not Found' };

    return {
        title: `${job.title} at ${job.company} | Barber Jobs`,
        description: `Apply for the ${job.title} position at ${job.company} in ${job.location}.`,
    };
}

export const revalidate = 21600;

export default async function JobPage({ params }: Props) {
    const job = await prisma.job.findUnique({
        where: { slug: params.slug },
        include: { source: true }
    });

    if (!job) notFound();

    // JobPosting Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        identifier: {
            '@type': 'PropertyValue',
            name: job.company,
            value: job.id,
        },
        datePosted: job.postedDate.toISOString(),
        validThrough: job.expiryDate?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: job.city || job.location,
                addressCountry: job.country || 'UK',
            },
        },
        employmentType: job.jobType?.toUpperCase() || 'FULL_TIME',
        baseSalary: job.salaryMin ? {
            '@type': 'MonetaryAmount',
            currency: job.currency || 'GBP',
            value: {
                '@type': 'QuantitativeValue',
                minValue: job.salaryMin,
                maxValue: job.salaryMax || job.salaryMin,
                unitText: 'YEAR',
            },
        } : undefined,
        url: `${process.env.NEXT_PUBLIC_URL || 'https://barbersaas.com'}/jobs/${job.slug}`,
    };

    return (
        <div className="min-h-screen bg-blue-950 text-white p-6 md:p-12 font-sans selection:bg-amber-400 selection:text-blue-950">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="max-w-[1200px] mx-auto">
                <Link href="/jobs" className="font-mono text-xs font-bold text-amber-400 hover:text-white mb-8 inline-block uppercase tracking-widest border-b-2 border-transparent hover:border-white transition-all">
                    &larr; Back to Jobs
                </Link>

                <header className="mb-8 border-b-2 border-amber-400 pb-8">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">{job.title}</h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 text-lg font-bold uppercase tracking-wide">
                        <span className="text-amber-400">{job.company}</span>
                        <span className="text-blue-300">📍 {job.location}</span>
                        <span className="text-blue-500 font-mono text-sm border border-blue-800 px-2 py-1">
                            POSTED: {job.postedDate.toLocaleDateString()}
                        </span>
                    </div>
                </header>

                <main className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-8">
                        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-amber-400 prose-strong:text-amber-400">
                            <h3 className="font-mono text-amber-400 text-sm uppercase tracking-widest border-b border-blue-800 pb-2 mb-6">Description</h3>
                            <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="bg-blue-900/50 p-6 sticky top-8 border-2 border-amber-400 shadow-[8px_8px_0px_0px_#fbbf24]">
                            <h3 className="font-black text-xl uppercase tracking-tighter mb-6 text-white border-b-2 border-blue-950 pb-2">Role Details</h3>
                            <ul className="space-y-6 text-blue-100 mb-8">
                                {job.salaryMin && (
                                    <li className="flex flex-col">
                                        <span className="font-mono textxs font-bold text-amber-400/70 uppercase tracking-widest mb-1">Salary</span>
                                        <span className="font-bold text-xl">
                                            {job.currency || '£'}{job.salaryMin}
                                            {job.salaryMax ? ` - ${job.salaryMax}` : ''}
                                        </span>
                                    </li>
                                )}
                                <li className="flex flex-col">
                                    <span className="font-mono textxs font-bold text-amber-400/70 uppercase tracking-widest mb-1">Type</span>
                                    <span className="font-bold text-xl uppercase">{job.jobType?.replace('_', ' ') || 'Full Time'}</span>
                                </li>
                                <li className="flex flex-col">
                                    <span className="font-mono textxs font-bold text-amber-400/70 uppercase tracking-widest mb-1">Location</span>
                                    <span className="font-bold text-xl">{job.location}</span>
                                </li>
                            </ul>

                            <ApplyButton jobId={job.id} sourceUrl={job.sourceUrl} />
                            <p className="font-mono text-[10px] text-blue-400 mt-4 text-center uppercase tracking-widest">
                                Source: {job.source?.name || 'Unknown'}
                            </p>
                            <ReportButton jobId={job.id} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
