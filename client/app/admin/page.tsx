'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CLUBS, GET_EVENTS } from '@/lib/graphql/queries';
import { CREATE_CLUB, DELETE_CLUB, CREATE_EVENT, DELETE_EVENT } from '@/lib/graphql/mutations';
import { Navbar } from '@/components/Navbar';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { CLUB_MEMBERSHIP_CHANGED, EVENT_CREATED } from '@/lib/graphql/queries';

const categoryOptions = ['SPORTS', 'ARTS', 'SCIENCE', 'MUSIC', 'ACADEMIC', 'OTHER'];
const dressCodeOptions = ['CASUAL', 'SMART_CASUAL', 'FORMAL', 'UNIFORM', 'SPORTS'];

export default function AdminPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clubs' | 'events'>('clubs');
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const clubFormRef = useRef<HTMLFormElement>(null);
  const eventFormRef = useRef<HTMLFormElement>(null);

  const { data: clubsData, loading: clubsLoading, refetch: refetchClubs } = useQuery(GET_CLUBS, {
    skip: !isAuthenticated || user?.role !== 'ADMIN',
  });

  const { data: eventsData, loading: eventsLoading, refetch: refetchEvents } = useQuery(GET_EVENTS, {
    skip: !isAuthenticated || user?.role !== 'ADMIN',
  });

  const [createClub] = useMutation(CREATE_CLUB, {
    onCompleted: () => {
      refetchClubs();
      setShowCreateClub(false);
      setTimeout(() => {
        if (clubFormRef.current) {
          clubFormRef.current.reset();
        }
      }, 100);
    },
  });

  const [deleteClub] = useMutation(DELETE_CLUB, {
    onCompleted: () => {
      refetchClubs();
    },
  });

  const [createEvent] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      refetchEvents();
      setShowCreateEvent(false);
      setTimeout(() => {
        if (eventFormRef.current) {
          eventFormRef.current.reset();
        }
      }, 100);
    },
  });

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      refetchEvents();
    },
  });

  useSubscription(CLUB_MEMBERSHIP_CHANGED, {
    onData: () => {
      refetchClubs();
    },
  });

  useSubscription(EVENT_CREATED, {
    onData: () => {
      refetchEvents();
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'ADMIN') {
      router.push('/clubs');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const handleCreateClub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createClub({
        variables: {
          input: {
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            capacity: parseInt(formData.get('capacity') as string),
          },
        },
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createEvent({
        variables: {
          input: {
            title: formData.get('title'),
            description: formData.get('description'),
            date: formData.get('date'),
            location: formData.get('location'),
            time: formData.get('time'),
            dressCode: formData.get('dressCode'),
            clubId: formData.get('clubId'),
          },
        },
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (confirm('Are you sure you want to delete this club?')) {
      try {
        await deleteClub({ variables: { id } });
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent({ variables: { id } });
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('clubs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clubs'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Clubs
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Events
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'clubs' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowCreateClub(!showCreateClub);
                  if (showCreateClub && clubFormRef.current) {
                    clubFormRef.current.reset();
                  }
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md"
              >
                {showCreateClub ? 'Cancel' : 'Create New Club'}
              </button>
            </div>

            {showCreateClub && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Create Club</h2>
                <form ref={clubFormRef} onSubmit={handleCreateClub}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        name="capacity"
                        required
                        min="1"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Create Club
                  </button>
                </form>
              </div>
            )}

            {clubsLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubsData?.clubs.map((club: any) => (
                  <div key={club.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">{club.name}</h3>
                    <p className="text-gray-600 mb-4">{club.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {club.memberCount} / {club.capacity} members
                    </p>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
                    >
                      Delete Club
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowCreateEvent(!showCreateEvent);
                  if (showCreateEvent && eventFormRef.current) {
                    eventFormRef.current.reset();
                  }
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md"
              >
                {showCreateEvent ? 'Cancel' : 'Create New Event'}
              </button>
            </div>

            {showCreateEvent && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Create Event</h2>
                <form ref={eventFormRef} onSubmit={handleCreateEvent}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                      <select
                        name="clubId"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {clubsData?.clubs.map((club: any) => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        name="time"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dress Code</label>
                      <select
                        name="dressCode"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {dressCodeOptions.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Create Event
                  </button>
                </form>
              </div>
            )}

            {eventsLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData?.events.map((event: any) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{event.description}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      {event.date && !isNaN(new Date(event.date).getTime())
                        ? `${new Date(event.date).toLocaleDateString()} at ${event.time || 'Time TBD'}`
                        : 'Date TBD'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">{event.location}</p>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
                    >
                      Delete Event
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}





