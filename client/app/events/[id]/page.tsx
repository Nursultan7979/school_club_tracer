'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GET_EVENT } from '@/lib/graphql/queries';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

const dressCodeLabels: Record<string, string> = {
  CASUAL: 'Casual',
  SMART_CASUAL: 'Smart Casual',
  FORMAL: 'Formal',
  UNIFORM: 'Uniform',
  SPORTS: 'Sports',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const eventId = params.id as string;

  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: { id: eventId },
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;
  if (loading) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12">Loading...</div></div>;
  if (error) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12 text-red-600">Error: {error.message}</div></div>;
  if (!data?.event) return <div className="min-h-screen"><Navbar /><div className="text-center mt-12">Event not found</div></div>;

  const event = data.event;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          <div className="mb-6">
            <Link
              href={`/clubs/${event.club.id}`}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              {event.club.name}
            </Link>
          </div>
          <p className="text-gray-700 mb-8 text-lg">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Date & Time</h3>
              <p className="text-gray-900">
                {event.date && !isNaN(new Date(event.date).getTime())
                  ? new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Date TBD'}
              </p>
              <p className="text-gray-600 mt-1">{event.time || 'Time TBD'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
              <p className="text-gray-900">{event.location}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Dress Code</h3>
              <p className="text-gray-900">{dressCodeLabels[event.dressCode] || event.dressCode}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Club</h3>
              <Link
                href={`/clubs/${event.club.id}`}
                className="text-primary-600 hover:text-primary-800"
              >
                {event.club.name}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




