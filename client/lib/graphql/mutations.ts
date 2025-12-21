import { gql } from '@apollo/client';

export const JOIN_CLUB = gql`
  mutation JoinClub($clubId: ID!) {
    joinClub(clubId: $clubId) {
      id
      user {
        id
        name
      }
      club {
        id
        name
      }
      status
    }
  }
`;

export const LEAVE_CLUB = gql`
  mutation LeaveClub($clubId: ID!) {
    leaveClub(clubId: $clubId)
  }
`;

export const CREATE_CLUB = gql`
  mutation CreateClub($input: CreateClubInput!) {
    createClub(input: $input) {
      id
      name
      description
      category
      capacity
    }
  }
`;

export const DELETE_CLUB = gql`
  mutation DeleteClub($id: ID!) {
    deleteClub(id: $id)
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
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

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;






