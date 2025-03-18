# Photo Op MVP

An AI-powered photo transformation application that allows users to apply various artistic styles to their images.

## Features

- User authentication and authorization
- Image upload and transformation
- Multiple artistic style options
- Style blending capabilities
- Real-time transformation status updates
- Secure API endpoints
- Performance monitoring and metrics

## Tech Stack

- Node.js/Express.js (Backend)
- React (Frontend)
- MongoDB (Database)
- Docker (Containerization)
- Prometheus/Grafana (Monitoring)
- Jest (Testing)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Docker and Docker Compose
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photo-op-mvp.git
cd photo-op-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the application:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

For coverage report:
```bash
npm run test:coverage
```

## Docker Deployment

Build and run with Docker Compose:
```bash
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 