
import { createManualJob } from './actions'

export default function NewJobPage() {
    return (
        <div className="p-8 text-white min-h-screen bg-neutral-900 font-sans">
            <header className="mb-8 border-b border-neutral-700 pb-4">
                <h1 className="text-3xl font-bold mb-2">Post New Job</h1>
                <p className="text-neutral-400">Manually add a job listing to the board.</p>
            </header>

            <form action={createManualJob} className="max-w-2xl bg-neutral-800 p-8 rounded-xl border border-neutral-700 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Job Title *</label>
                        <input name="title" required placeholder="e.g. Senior Barber" className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Company Name *</label>
                        <input name="company" required placeholder="e.g. Fade Masters" className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Location *</label>
                        <input name="location" required placeholder="e.g. London, UK" className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Job Type</label>
                        <select name="jobType" className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none">
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="APPRENTICESHIP">Apprenticeship</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Salary Min (£)</label>
                        <input name="salaryMin" type="number" placeholder="20000" className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Salary Max (£)</label>
                        <input name="salaryMax" type="number" placeholder="35000" className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Application URL (Optional)</label>
                    <input name="applicationUrl" placeholder="https://..." className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                    <p className="text-xs text-neutral-500">Leave blank to use the internal apply button.</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Contact Email (Optional)</label>
                    <input name="contactEmail" type="email" placeholder="owner@shop.com" className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400">Description *</label>
                    <textarea name="description" required rows={6} className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded text-white focus:border-amber-400 outline-none" />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button type="submit" className="bg-amber-400 text-blue-950 font-black uppercase tracking-widest px-8 py-3 hover:bg-white transition-all">
                        Post Job &rarr;
                    </button>
                </div>

            </form>
        </div>
    )
}
