import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Draft.IO Blog Service API',
      version: '1.0.0',
      description: 'Blog management service - create, publish, update, and delete blog posts with rich content features',
      contact: {
        name: 'Draft.IO Team',
        url: 'https://github.com/yourusername/draft.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:5003',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Blog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            author_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string' },
            cover_image_url: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published'] },
            view_count: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateBlogRequest: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string', example: 'My First Blog Post' },
            content: { type: 'string', example: '<p>This is the blog content</p>' },
            excerpt: { type: 'string', example: 'A brief summary' },
            cover_image_url: { type: 'string', example: 'https://example.com/image.jpg' },
            tags: { type: 'array', items: { type: 'string' }, example: ['tech', 'javascript'] },
            categories: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    tags: [
      { name: 'Blogs', description: 'Blog post management' },
      { name: 'Tags', description: 'Tags and categories' },
      { name: 'Health', description: 'Service health check' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
