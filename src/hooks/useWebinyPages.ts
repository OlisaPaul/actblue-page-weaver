import { useMutation, useQuery } from '@apollo/client';
import { 
  CREATE_CAMPAIGN_PAGE,
  UPDATE_CAMPAIGN_PAGE, 
  GET_CAMPAIGN_PAGES,
  GET_CAMPAIGN_PAGE
} from '../graphql/pages';
import { useAuth } from '../contexts/AuthContext';
import { PageComponent } from '../components/page-builder/PageBuilder';

export const useWebinyPages = () => {
  const { user } = useAuth();

  // Save page
  const [createPage] = useMutation(CREATE_CAMPAIGN_PAGE);
  const [updatePage] = useMutation(UPDATE_CAMPAIGN_PAGE);

  // Load pages
  const { data: pagesData, loading, refetch } = useQuery(GET_CAMPAIGN_PAGES, {
    variables: {
      where: {
        createdBy: user?.id
      }
    },
    skip: !user
  });

  const savePage = async (
    title: string, 
    components: PageComponent[], 
    pageId?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    const pageData = {
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      components: JSON.stringify(components),
      createdBy: user.id,
      status: 'draft'
    };

    try {
      if (pageId) {
        const { data } = await updatePage({
          variables: {
            revision: pageId,
            data: pageData
          }
        });
        return data.updateCampaignPage.data;
      } else {
        const { data } = await createPage({
          variables: {
            data: pageData
          }
        });
        return data.createCampaignPage.data;
      }
    } catch (error) {
      console.error('Error saving page:', error);
      throw error;
    }
  };

  const loadPage = async (pageId: string) => {
    // Implementation for loading a specific page
  };

  const getUserPages = () => {
    return pagesData?.listCampaignPages?.data || [];
  };

  return {
    savePage,
    loadPage,
    getUserPages,
    loading,
    refetch
  };
};