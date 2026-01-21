import { getDiscoveryData } from './actions'
import DiscoveryFeed from './discovery-feed'
import SearchHeader from './search-header'
import { redirect } from 'next/navigation'

export default async function RecruitmentPage({ searchParams }: { searchParams: { q?: string, l?: string, sort?: string } }) {
    const data = await getDiscoveryData(searchParams.q, searchParams.l, searchParams.sort)

    if (!data) {
        redirect('/login')
    }

    return (
        <div className="flex flex-col min-h-screen bg-blue-950">
            <SearchHeader />

            <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                <DiscoveryFeed
                    barbers={data.barbers}
                    shops={data.shops}
                    user={data.user}
                />
            </div>
        </div>
    )
}
