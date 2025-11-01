import NavbarSkeleton from '@/components/layout/NavbarSkeleton'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with all buttons visible */}
      <NavbarSkeleton />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 animate-pulse">
          {/* Header */}
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-t w-32"></div>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-12 bg-gray-100 border-b"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 border-b border-gray-200 px-6 flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
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
