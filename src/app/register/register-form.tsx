'use client'

import { useState } from 'react'
import { registerShop } from './actions'

export default function RegisterForm({ defaultEmail, defaultName }: { defaultEmail: string, defaultName: string }) {
    const [accountType, setAccountType] = useState<'PERSONAL' | 'BUSINESS'>('BUSINESS')

    return (
        <form action={registerShop} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <input type="hidden" name="accountType" value={accountType} />

            {/* Account Type Toggle */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                    type="button"
                    onClick={() => setAccountType('PERSONAL')}
                    className={`p-4 border-2 text-center transition-all ${accountType === 'PERSONAL'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-white/10 text-white/40 hover:border-white/30'
                        }`}
                >
                    <div className="text-2xl mb-2">✂️</div>
                    <div className="text-xs font-bold uppercase tracking-widest">Solo Barber</div>
                </button>
                <button
                    type="button"
                    onClick={() => setAccountType('BUSINESS')}
                    className={`p-4 border-2 text-center transition-all ${accountType === 'BUSINESS'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-white/10 text-white/40 hover:border-white/30'
                        }`}
                >
                    <div className="text-2xl mb-2">💈</div>
                    <div className="text-xs font-bold uppercase tracking-widest">Barbershop</div>
                </button>
            </div>

            {/* Dynamic Fields */}
            <div>
                <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">
                    {accountType === 'BUSINESS' ? 'Shop / Brand Name' : 'Your Brand / Portfolio Name'}
                </label>
                <input
                    name="shopName"
                    type="text"
                    required
                    placeholder={accountType === 'BUSINESS' ? "e.g. Blade & Fades" : "e.g. Cuts by Joe"}
                    className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Full Name</label>
                    <input
                        name="ownerName"
                        type="text"
                        required
                        defaultValue={defaultName}
                        placeholder="e.g. Joe Barber"
                        className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Mobile Number</label>
                    <input
                        name="phone"
                        type="tel"
                        placeholder="e.g. 07700 900000"
                        className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Login Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    defaultValue={defaultEmail}
                    placeholder="you@example.com"
                    className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                />
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Create Password</label>
                <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    minLength={8}
                    className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                />
            </div>

            <button type="submit" className="w-full p-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm mt-8">
                {accountType === 'BUSINESS' ? 'Launch Shop System' : 'Launch Solo System'}
            </button>
        </form>
    )
}
