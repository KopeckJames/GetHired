# GetHired! - Job Application Tracker

A modern web application for tracking job applications, built with Remix, MongoDB, and Google OAuth.

## Features

- Google Authentication
- Document Management (Resume, Cover Letters, etc.)
- Job Application Tracking
- Modern UI with Tailwind CSS

## Tech Stack

- [Remix](https://remix.run/) - Full-stack web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- MongoDB Atlas account or local MongoDB instance
- Google Cloud Console project with OAuth 2.0 credentials

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gethired-app.git
cd gethired-app
```

2. Install dependencies:
```bash
npm install
```

3. Generate a secure JWT secret:
```bash
npm run generate-jwt-secret
```
This will generate a secure random string to use as your JWT secret. Copy the generated value.

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `MONGODB_URI`: Your MongoDB connection string (from MongoDB Atlas or local instance)
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (from Google Cloud Console)
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret (from Google Cloud Console)
- `JWT_SECRET`: Paste the JWT secret you generated in step 3

5. Set up MongoDB:
   - Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier available)
   - Create a new cluster
   - Click "Connect" and choose "Connect your application"
   - Copy the connection string and replace `<password>` with your database user password
   - Paste the connection string as your `MONGODB_URI` in `.env`

6. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google OAuth2 API
   - Go to "Credentials" and create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)
   - Copy the Client ID and Client Secret to your `.env` file

7. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Schema

### Users
- `_id`: ObjectId
- `email`: String
- `name`: String
- `picture`: String (optional)
- `createdAt`: Date

### Documents
- `_id`: ObjectId
- `userId`: ObjectId
- `name`: String
- `type`: String (enum: resume, cover_letter, job_description, other)
- `content`: String
- `uploadedAt`: Date

## Authentication Flow

1. User clicks "Sign in with Google"
2. User is redirected to Google OAuth consent screen
3. After consent, Google redirects back to `/auth/callback`
4. Server verifies the OAuth code and creates/updates user in MongoDB
5. JWT token is generated and stored in client
6. Subsequent requests use JWT for authentication

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run typecheck` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm run generate-jwt-secret` - Generate a secure JWT secret

### Project Structure

```
app/
├── components/     # Reusable UI components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── models/        # MongoDB models and database functions
├── routes/        # Remix routes and API endpoints
├── styles/        # Global styles and Tailwind config
├── types/         # TypeScript type definitions
└── utils/         # Utility functions and helpers
```

## Security Notes

1. JWT Secret:
   - Use `npm run generate-jwt-secret` to create a secure random secret
   - Never share or commit your JWT secret
   - If compromised, generate a new secret and update it in your environment

2. Environment Variables:
   - Never commit `.env` file to version control
   - Keep your MongoDB URI private
   - Protect your Google OAuth credentials
   - Regularly rotate secrets in production

## Deployment

1. Set up your production environment variables
2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
