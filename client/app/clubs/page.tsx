'use client';

import { useQuery } from '@apollo/client';
import { GET_CLUBS } from '@/lib/graphql/queries';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const categoryColors: Record<string, string> = {
  SPORTS: 'bg-blue-100 text-blue-800',
  ARTS: 'bg-purple-100 text-purple-800',
  SCIENCE: 'bg-green-100 text-green-800',
  MUSIC: 'bg-yellow-100 text-yellow-800',
  ACADEMIC: 'bg-red-100 text-red-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function ClubsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_CLUBS);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (loading) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12">Loading...</div></div>;
  if (error) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12 text-red-600">Error: {error.message}</div></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Clubs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.clubs?.map((club: any) => (
            <div key={club.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{club.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[club.category] || categoryColors.OTHER}`}>
                  {club.category}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{club.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">
                  {club.memberCount} / {club.capacity} members
                </span>
              </div>
              <Link
                href={`/clubs/${club.id}`}
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
        {(!data?.clubs || data.clubs.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No clubs available.</p>
          </div>
        )}
      </main>
    </div>
  );
}




