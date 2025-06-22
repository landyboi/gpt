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
- **Database**: PostgreSQL (Dockerized)
- **Authentication**: Custom session-based auth
- **Styling**: Tailwind CSS, shadcn/ui
- **Development**: Docker, Docker Compose, Nginx (HTTPS reverse proxy)

## Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 18+ and npm (for local development)

## Getting Started (Dockerized, with HTTPS)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gpt-chat
   ```

2. **Generate self-signed SSL certificates for Nginx:**
   ```bash
   ./generate_certs.sh
   ```
   *(Or run the commands in the script manually on Linux)*

3. **Start the application stack:**
   ```bash
   docker-compose up --build
   ```

4. **Access the app securely:**
   - Open [https://localhost](https://localhost) or [https://gptdev](https://gptdev) in your browser.
   - Accept the self-signed certificate warning (normal for local dev).

5. **Update and restart containers:**
   ```bash
   ./update_and_restart.sh
   ```

## Environment Variables

Environment variables are set in `docker-compose.yml` for the app service. Example:
```yaml
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres
      - NODE_ENV=production
      - LLAMA_API_URL=http://llama:11434
      - LLAMA_MODEL=llama3
```

## HTTPS & Secure Cookies

- The app is served via HTTPS using Nginx as a reverse proxy.
- Secure cookies are supported and required for authentication.
- **Do not access the app via port 3000**; use only `https://localhost` or `https://gptdev`.
- Port 3000 is internal-only and not exposed to the host.

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

## Troubleshooting

- **Secure cookie rejected?**
  - Make sure you are accessing the app via `https://localhost` or `https://gptdev`.
  - Do not use `http://` or port 3000 directly.
  - Accept the self-signed certificate in your browser.
- **Database not persisting?**
  - Data is stored in Docker volumes. Only `docker-compose down -v` will erase it.
- **Update and restart containers:**
  - Use `./update_and_restart.sh` to pull the latest code and restart everything.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
