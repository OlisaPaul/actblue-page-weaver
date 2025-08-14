import { gql } from '@apollo/client';

export const CREATE_CAMPAIGN_PAGE = gql`
  mutation CreateCampaignPage($data: CampaignPageInput!) {
    createCampaignPage(data: $data) {
      data {
        id
        title
        slug
        components
        createdBy
        status
        createdOn
        savedOn
      }
      error {
        code
        message
      }
    }
  }
`;

export const UPDATE_CAMPAIGN_PAGE = gql`
  mutation UpdateCampaignPage($revision: ID!, $data: CampaignPageInput!) {
    updateCampaignPage(revision: $revision, data: $data) {
      data {
        id
        title
        slug
        components
        createdBy
        status
        savedOn
      }
      error {
        code
        message
      }
    }
  }
`;

export const GET_CAMPAIGN_PAGES = gql`
  query ListCampaignPages($where: CampaignPageListWhereInput) {
    listCampaignPages(where: $where) {
      data {
        id
        title
        slug
        components
        createdBy
        status
        createdOn
        savedOn
      }
    }
  }
`;

export const GET_CAMPAIGN_PAGE = gql`
  query GetCampaignPage($revision: ID!) {
    getCampaignPage(revision: $revision) {
      data {
        id
        title
        slug
        components
        createdBy
        status
        createdOn
        savedOn
      }
    }
  }
`;

export const UPLOAD_FILE = gql`
  mutation UploadFile($data: FileInput!) {
    createFile(data: $data) {
      data {
        id
        key
        name
        src
        size
        type
      }
      error {
        code
        message
      }
    }
  }
`;

export const CREATE_FILE = gql`
  mutation CreateFile($data: FileCreateInput!) {
    fileManager {
      createFile(data: $data) {
        data {
          id
          key
          src
          type
        }
        error {
          message
        }
      }
    }
  }
`;