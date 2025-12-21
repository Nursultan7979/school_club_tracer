import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  type Club {
    id: ID!
    name: String!
    description: String!
    category: ClubCategory!
    capacity: Int!
    createdBy: User!
    members: [Membership!]!
    memberCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Event {
    id: ID!
    title: String!
    description: String!
    date: String!
    location: String!
    time: String!
    dressCode: DressCode!
    club: Club!
    createdAt: String!
    updatedAt: String!
  }

  type Membership {
    id: ID!
    user: User!
    club: Club!
    joinedAt: String!
    status: MembershipStatus!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum UserRole {
    STUDENT
    ADMIN
  }

  enum ClubCategory {
    SPORTS
    ARTS
    SCIENCE
    MUSIC
    ACADEMIC
    OTHER
  }

  enum DressCode {
    CASUAL
    SMART_CASUAL
    FORMAL
    UNIFORM
    SPORTS
  }

  enum MembershipStatus {
    ACTIVE
    INACTIVE
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: UserRole
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateClubInput {
    name: String!
    description: String!
    category: ClubCategory!
    capacity: Int!
  }

  input UpdateClubInput {
    name: String
    description: String
    category: ClubCategory
    capacity: Int
  }

  input CreateEventInput {
    title: String!
    description: String!
    date: String!
    location: String!
    time: String!
    dressCode: DressCode!
    clubId: ID!
  }

  input UpdateEventInput {
    title: String
    description: String
    date: String
    location: String
    time: String
    dressCode: DressCode
  }

  type Query {
    # Auth
    me: User

    # Clubs
    clubs: [Club!]!
    club(id: ID!): Club
    myClubs: [Club!]!

    # Events
    events: [Event!]!
    event(id: ID!): Event
    eventsByClub(clubId: ID!): [Event!]!

    # Memberships
    memberships(clubId: ID): [Membership!]!
    myMemberships: [Membership!]!
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Clubs
    createClub(input: CreateClubInput!): Club!
    updateClub(id: ID!, input: UpdateClubInput!): Club!
    deleteClub(id: ID!): Boolean!

    # Events
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Boolean!

    # Memberships
    joinClub(clubId: ID!): Membership!
    leaveClub(clubId: ID!): Boolean!
  }

  type Subscription {
    # Real-time updates
    clubMembershipChanged(clubId: ID!): Membership!
    eventCreated(clubId: ID): Event!
    eventUpdated(eventId: ID!): Event!
    eventDeleted(eventId: ID!): ID!
  }
`;






