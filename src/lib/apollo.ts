import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { WEBINY_CONFIG } from '../config/webiny';

const httpLink = createHttpLink({
  uri: `${WEBINY_CONFIG.apiUrl}/graphql`
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('webiny-token');
  
  return {
    headers: {
      ...headers,
      authorization: `Bearer a94ab750b1149c2f73add59815bba3549bd0c17c971df733`,
      'x-tenant': WEBINY_CONFIG.tenantId,
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});