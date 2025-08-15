import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const API_URL = "https://dnfl6w84lsulj.cloudfront.net/cms/manage/en-US";

// If you have a permanent access token, set it here
const ACCESS_TOKEN = "a94ab750b1149c2f73add59815bba3549bd0c17c971df733";
// Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."

const httpLink = new HttpLink({
  uri: API_URL,
  headers: {
    Authorization: ACCESS_TOKEN,
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
