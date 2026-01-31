import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Draft.IO User Service API',
      version: '1.0.0',
      description: 'User profile and social features - manage user profiles, followers, and social connections',
    },
    servers: [
      { url: 'http://localhost:5002', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Profile', description: 'User profile management' },
      { name: 'Follow', description: 'Follow/unfollow users' },
      { name: 'Health', description: 'Service health check' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
