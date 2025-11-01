import NavbarSkeleton from '@/components/layout/NavbarSkeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with all buttons visible */}
      <NavbarSkeleton />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 animate-pulse">
          {/* Welcome Section Skeleton */}
          <div>
            <div className="h-9 bg-gray-200 rounded w-1/3"></div>
            <div className="mt-2 h-6 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="mt-2 h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                </div>
                <div className="mt-4 h-9 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Anuranan - Bengali Recitation Training Institute
          </p>
        </div>
      </footer>
    </div>
  )
}
