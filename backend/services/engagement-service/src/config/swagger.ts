import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Draft.IO Engagement Service API',
      version: '1.0.0',
      description: 'Social engagement features - likes, comments, and bookmarks for blog posts',
    },
    servers: [
      { url: 'http://localhost:5004', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Likes', description: 'Like/unlike blog posts' },
      { name: 'Comments', description: 'Comment on blog posts' },
      { name: 'Bookmarks', description: 'Bookmark blog posts' },
      { name: 'Health', description: 'Service health check' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
