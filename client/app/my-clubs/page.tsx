'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_CLUBS, GET_CLUBS } from '@/lib/graphql/queries';
import { LEAVE_CLUB } from '@/lib/graphql/mutations';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { CLUB_MEMBERSHIP_CHANGED } from '@/lib/graphql/queries';

const categoryColors: Record<string, string> = {
  SPORTS: 'bg-blue-100 text-blue-800',
  ARTS: 'bg-purple-100 text-purple-800',
  SCIENCE: 'bg-green-100 text-green-800',
  MUSIC: 'bg-yellow-100 text-yellow-800',
  ACADEMIC: 'bg-red-100 text-red-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function MyClubsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_MY_CLUBS, {
    skip: !isAuthenticated || user?.role !== 'STUDENT',
  });

  const [leaveClub] = useMutation(LEAVE_CLUB, {
    onCompleted: () => {
      refetch();
    },
  });

  useSubscription(CLUB_MEMBERSHIP_CHANGED, {
    onData: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'STUDENT') {
      router.push('/clubs');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'STUDENT') return null;
  if (loading) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12">Loading...</div></div>;
  if (error) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12 text-red-600">Error: {error.message}</div></div>;

  const handleLeave = async (clubId: string) => {
    if (confirm('Are you sure you want to leave this club?')) {
      try {
        await leaveClub({ variables: { clubId } });
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Clubs</h1>
        {data?.myClubs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">You haven't joined any clubs yet.</p>
            <Link
              href="/clubs"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Browse Clubs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.myClubs.map((club: any) => (
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
                <div className="flex gap-2">
                  <Link
                    href={`/clubs/${club.id}`}
                    className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleLeave(club.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}






