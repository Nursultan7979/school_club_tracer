import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const GET_ME = gql`
  query Me {
    me {
      id
      email
      name
      role
    }
  }
`;

export const GET_CLUBS = gql`
  query Clubs {
    clubs {
      id
      name
      description
      category
      capacity
      memberCount
      createdBy {
        id
        name
      }
    }
  }
`;

export const GET_CLUB = gql`
  query Club($id: ID!) {
    club(id: $id) {
      id
      name
      description
      category
      capacity
      memberCount
      members {
        id
        user {
          id
          name
          email
        }
        joinedAt
      }
      createdBy {
        id
        name
      }
    }
  }
`;

export const GET_MY_CLUBS = gql`
  query MyClubs {
    myClubs {
      id
      name
      description
      category
      capacity
      memberCount
    }
  }
`;

export const GET_EVENTS = gql`
  query Events {
    events {
      id
      title
      description
      date
      location
      time
      dressCode
      club {
        id
        name
      }
    }
  }
`;

export const GET_EVENT = gql`
  query Event($id: ID!) {
    event(id: $id) {
      id
      title
      description
      date
      location
      time
      dressCode
      club {
        id
        name
        description
      }
    }
  }
`;

export const GET_EVENTS_BY_CLUB = gql`
  query EventsByClub($clubId: ID!) {
    eventsByClub(clubId: $clubId) {
      id
      title
      description
      date
      location
      time
      dressCode
    }
  }
`;

export const GET_MEMBERSHIPS = gql`
  query Memberships($clubId: ID) {
    memberships(clubId: $clubId) {
      id
      user {
        id
        name
        email
      }
      club {
        id
        name
      }
      joinedAt
      status
    }
  }
`;

export const CLUB_MEMBERSHIP_CHANGED = gql`
  subscription ClubMembershipChanged($clubId: ID!) {
    clubMembershipChanged(clubId: $clubId) {
      id
      user {
        id
        name
        email
      }
      club {
        id
        name
      }
      joinedAt
      status
    }
  }
`;

export const EVENT_CREATED = gql`
  subscription EventCreated($clubId: ID) {
    eventCreated(clubId: $clubId) {
      id
      title
      description
      date
      location
      time
      dressCode
      club {
        id
        name
      }
    }
  }
`;






