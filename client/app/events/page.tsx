'use client';

import { useQuery } from '@apollo/client';
import { GET_EVENTS } from '@/lib/graphql/queries';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { EVENT_CREATED } from '@/lib/graphql/queries';

const dressCodeLabels: Record<string, string> = {
  CASUAL: 'Casual',
  SMART_CASUAL: 'Smart Casual',
  FORMAL: 'Formal',
  UNIFORM: 'Uniform',
  SPORTS: 'Sports',
};

export default function EventsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_EVENTS);

  useSubscription(EVENT_CREATED, {
    onData: () => {
      refetch();
    },
  });

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.events?.map((event: any) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">
                    {event.date && !isNaN(new Date(event.date).getTime()) 
                      ? new Date(event.date).toLocaleDateString() 
                      : 'Date TBD'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Time:</span>
                  <span className="ml-2">{event.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{event.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Dress Code:</span>
                  <span className="ml-2">{dressCodeLabels[event.dressCode] || event.dressCode}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Club:</span>
                  <span className="ml-2">{event.club.name}</span>
                </div>
              </div>
              <Link
                href={`/events/${event.id}`}
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
        {(!data?.events || data.events.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events available.</p>
          </div>
        )}
      </main>
    </div>
  );
}




