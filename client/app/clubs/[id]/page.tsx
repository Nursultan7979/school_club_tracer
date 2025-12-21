'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_CLUB, CLUB_MEMBERSHIP_CHANGED } from '@/lib/graphql/queries';
import { JOIN_CLUB, LEAVE_CLUB } from '@/lib/graphql/mutations';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client';

const categoryColors: Record<string, string> = {
  SPORTS: 'bg-blue-100 text-blue-800',
  ARTS: 'bg-purple-100 text-purple-800',
  SCIENCE: 'bg-green-100 text-green-800',
  MUSIC: 'bg-yellow-100 text-yellow-800',
  ACADEMIC: 'bg-red-100 text-red-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isMember, setIsMember] = useState(false);
  const clubId = params.id as string;

  const { data, loading, error, refetch } = useQuery(GET_CLUB, {
    variables: { id: clubId },
    skip: !isAuthenticated,
  });

  useSubscription(CLUB_MEMBERSHIP_CHANGED, {
    variables: { clubId },
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData.data) {
        refetch();
      }
    },
  });

  const [joinClub] = useMutation(JOIN_CLUB, {
    onCompleted: () => {
      refetch();
    },
  });

  const [leaveClub] = useMutation(LEAVE_CLUB, {
    onCompleted: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (data?.club && user) {
      const membership = data.club.members.find(
        (m: any) => m.user.id === user.id && m.status === 'ACTIVE'
      );
      setIsMember(!!membership);
    }
  }, [data, user]);

  if (!isAuthenticated) return null;
  if (loading) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12">Loading...</div></div>;
  if (error) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12 text-red-600">Error: {error.message}</div></div>;
  if (!data?.club) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12">Club not found</div></div>;

  const club = data.club;

  const handleJoin = async () => {
    try {
      await joinClub({ variables: { clubId } });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLeave = async () => {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColors[club.category] || categoryColors.OTHER}`}>
                {club.category}
              </span>
            </div>
            {user?.role === 'STUDENT' && (
              <div>
                {isMember ? (
                  <button
                    onClick={handleLeave}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    Leave Club
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    Join Club
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-6">{club.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-500 text-sm">Capacity:</span>
              <p className="text-lg font-semibold">
                {club.memberCount} / {club.capacity} members
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Created by:</span>
              <p className="text-lg font-semibold">{club.createdBy.name}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Members</h2>
            <div className="space-y-2">
              {club.members.length === 0 ? (
                <p className="text-gray-500">No members yet.</p>
              ) : (
                club.members.map((membership: any) => (
                  <div key={membership.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{membership.user.name}</p>
                      <p className="text-sm text-gray-500">{membership.user.email}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      Joined: {new Date(membership.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




