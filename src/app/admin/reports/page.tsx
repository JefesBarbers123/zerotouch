
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getReports() {
    return await prisma.jobReport.findMany({
        include: {
            job: {
                include: { source: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

async function handleAction(formData: FormData) {
    'use server'
    const action = formData.get('action')
    const reportId = formData.get('reportId') as string
    const jobId = formData.get('jobId') as string
    const sourceId = formData.get('sourceId') as string

    if (action === 'dismiss') {
        await prisma.jobReport.delete({ where: { id: reportId } })
    } else if (action === 'delete_job') {
        await prisma.job.delete({ where: { id: jobId } })
        // Prisma cascade should handle report, or manually:
        // await prisma.jobReport.delete({ where: { id: reportId } })
    } else if (action === 'ban_source') {
        await prisma.jobSource.update({
            where: { id: sourceId },
            data: { isActive: false }
        })
        await prisma.job.delete({ where: { id: jobId } })
    }

    revalidatePath('/admin/reports')
}

export default async function AdminReportsPage() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
        redirect('/dashboard')
    }

    const reports = await getReports()

    return (
        <div className="min-h-screen bg-blue-950 text-white p-8">
            <header className="flex justify-between items-center mb-8 border-b-2 border-amber-400 pb-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-amber-400">
                        Content Reports
                    </h1>
                    <p className="text-white/50 font-mono text-sm uppercase">
                        {reports.length} pending items
                    </p>
                </div>
            </header>

            <div className="space-y-6 max-w-5xl">
                {reports.length === 0 && (
                    <div className="p-12 text-center border-2 border-white/5 bg-white/5 rounded">
                        <p className="text-white/30 font-mono uppercase tracking-widest">All Clear</p>
                    </div>
                )}

                {reports.map((report) => (
                    <div key={report.id} className="bg-blue-900/30 border border-white/10 p-6 rounded flex gap-6 items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="bg-red-500/20 text-red-400 px-2 py-1 text-[10px] uppercase font-bold tracking-widest border border-red-500/50">
                                    Reported
                                </span>
                                <span className="text-xs text-white/40 font-mono">
                                    {report.createdAt.toLocaleString()}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                {report.job.title} <span className="text-white/50">at {report.job.company}</span>
                            </h3>

                            <p className="text-sm text-amber-400 font-mono mb-4 border-l-2 border-amber-400 pl-3">
                                Reason: "{report.reason}"
                            </p>

                            <div className="text-xs text-white/30 font-mono">
                                Source: {report.job.source.name} ({report.job.source.type})
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <form action={handleAction}>
                                <input type="hidden" name="reportId" value={report.id} />
                                <input type="hidden" name="action" value="dismiss" />
                                <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-widest border border-white/10 text-white/70">
                                    Dismiss Report
                                </button>
                            </form>

                            <form action={handleAction}>
                                <input type="hidden" name="jobId" value={report.job.id} />
                                <input type="hidden" name="action" value="delete_job" />
                                <button className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-xs font-mono uppercase tracking-widest border border-red-500/30 text-red-400">
                                    Delete Job
                                </button>
                            </form>

                            <form action={handleAction}>
                                <input type="hidden" name="jobId" value={report.job.id} />
                                <input type="hidden" name="sourceId" value={report.job.sourceId} />
                                <input type="hidden" name="action" value="ban_source" />
                                <button className="w-full px-4 py-2 bg-red-950 hover:bg-red-900/80 text-xs font-mono uppercase tracking-widest border border-red-500/50 text-red-500">
                                    Ban Source
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
