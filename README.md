# GPT Chat Application

A modern chat application built with Next.js, TypeScript, and PostgreSQL, featuring real-time conversations and a clean, responsive UI.

## Features

- 🔐 Secure authentication system
- 💬 Real-time chat functionality
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 🔄 Conversation history
- 📝 Markdown support in messages
- 🌙 Dark mode support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: Custom session-based auth
- **Styling**: Tailwind CSS, shadcn/ui
- **Development**: Docker, Docker Compose

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gpt-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gptdev
   NEXTAUTH_SECRET=your-secret-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── chat/         # Chat-related endpoints
│   ├── chat/             # Chat pages
│   └── login/            # Login page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── db-utils.ts       # Database utilities
│   └── prisma.ts         # Prisma client
└── types/                # TypeScript type definitions
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users`: User accounts
- `sessions`: User sessions
- `conversations`: Chat conversations
- `messages`: Individual chat messages

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Docker Support

To run the application using Docker:

```bash
docker-compose up
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
