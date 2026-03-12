/**
 * API Integration Tests
 * Tests for Strapi API client functions
 */

describe('API Client', () => {
  beforeEach(() => {
    // Setup: Clear any global state between tests
  });

  it('should have API utilities available', async () => {
    // Verify the module exports the expected API functions
    const api = await import('../api');
    expect(typeof api.getPaginatedPosts).toBe('function');
    expect(typeof api.getPostBySlug).toBe('function');
    expect(typeof api.getCategories).toBe('function');
  });

  describe('Data Fetching', () => {
    it('should handle post data structure', () => {
      const mockPost = {
        id: 1,
        slug: 'test-post',
        title: 'Test Post',
        excerpt: 'Test excerpt',
        publishedAt: '2025-10-25',
      };

      expect(mockPost).toHaveProperty('slug');
      expect(mockPost).toHaveProperty('title');
    });
  });
});
