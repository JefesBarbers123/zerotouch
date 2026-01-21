
'use client'

import { useState } from 'react'
import { createService, deleteService, updateService } from './actions'

export default function ServiceManager({ services, isOwner }: { services: any[], isOwner: boolean }) {
    const [isPending, setIsPending] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    async function handleAdd(formData: FormData) {
        setIsPending(true)
        const res = await createService(formData)
        setIsPending(false)
        if (!res?.success) alert(res?.error || "Failed to add service")
        else {
            // Reset form
            (document.getElementById('add-service-form') as HTMLFormElement)?.reset()
        }
    }

    async function handleEdit(id: string, formData: FormData) {
        setIsPending(true)
        const res = await updateService(id, formData)
        setIsPending(false)
        if (!res?.success) alert(res?.error || "Failed to update service")
        else setEditingId(null)
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this service?")) return
        const res = await deleteService(id)
        if (!res.success) alert(res.error)
    }

    // Styles
    const inputClasses = "w-full bg-blue-950 border-2 border-amber-400/30 p-2 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
    const buttonClasses = "px-4 py-2 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-xs"

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {services.map((service: any) => (
                    <div key={service.id} className="p-4 bg-blue-950 border border-white/5 hover:border-green-400/50 transition-colors">
                        {editingId === service.id ? (
                            <form action={(fd) => handleEdit(service.id, fd)} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] text-amber-400 uppercase">Name</label>
                                    <input name="name" defaultValue={service.name} className={inputClasses} required />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] text-amber-400 uppercase">Price</label>
                                    <input name="price" type="number" step="0.01" defaultValue={service.price} className={inputClasses} required />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] text-amber-400 uppercase">Mins</label>
                                    <input name="duration" type="number" defaultValue={service.duration} className={inputClasses} required />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={isPending} className="bg-green-500 text-black px-3 py-2 font-bold text-xs uppercase">Save</button>
                                    <button type="button" onClick={() => setEditingId(null)} className="bg-white/10 text-white px-3 py-2 font-bold text-xs uppercase">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold uppercase tracking-wider text-sm">{service.name}</div>
                                    <div className="text-[10px] font-mono text-white/40 uppercase">{service.duration} mins • <span className="text-green-400">£{service.price.toFixed(2)}</span></div>
                                </div>
                                {isOwner && (
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingId(service.id)} className="text-xs text-amber-400 hover:text-white font-bold uppercase">Edit</button>
                                        <button onClick={() => handleDelete(service.id)} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase">Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {services.length === 0 && <p className="text-center font-mono text-xs text-white/30 uppercase py-8">No services configured.</p>}
            </div>

            {isOwner && (
                <form id="add-service-form" action={handleAdd} className="bg-blue-950/50 p-6 border-2 border-dashed border-white/10 mt-8">
                    <h3 className="text-xs font-bold uppercase text-white/70 mb-4 tracking-widest">Add New Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Service Name</label>
                            <input name="name" type="text" placeholder="e.g. Skin Fade" required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Price (£)</label>
                            <input name="price" type="number" step="0.01" placeholder="25.00" required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Duration (min)</label>
                            <input name="duration" type="number" step="5" placeholder="30" required className={inputClasses} />
                        </div>
                    </div>
                    <button type="submit" disabled={isPending} className={buttonClasses}>{isPending ? 'Adding...' : 'Add to Menu'}</button>
                </form>
            )}
        </div>
    )
}
