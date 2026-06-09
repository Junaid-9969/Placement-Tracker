const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Placement Management System API',
      version: '1.0.0',
      description: 'Complete REST API for Full-Stack Placement Management System with role-based access control',
      contact: { name: 'API Support', email: 'support@placement.com' }
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'student', 'company', 'trainer'] },
            isApproved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { '$ref': '#/components/schemas/User' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Students', description: 'Student management' },
      { name: 'Companies', description: 'Company management' },
      { name: 'Jobs', description: 'Job posting management' },
      { name: 'Applications', description: 'Job applications' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Trainers', description: 'Trainer operations' },
      { name: 'Analytics', description: 'Dashboard analytics' },
      { name: 'Upload', description: 'File uploads' }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);
module.exports = { swaggerUi, specs };
