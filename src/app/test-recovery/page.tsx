export const dynamic = 'force-dynamic'

export default function TestPage() {
    return (
        <div className="p-10 text-white bg-blue-900 min-h-screen">
            <h1 className="text-4xl font-bold">Deploy Test: SUCCESS</h1>
            <p>If you can see this, the site is updating correctly.</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    )
}
