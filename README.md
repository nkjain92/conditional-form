# Catering Theme Voting System

A simple voting system for catering themes with a maximum cap on votes per theme. Built with Next.js, Prisma, and Vercel Postgres.

## Features

- Vote for available catering themes
- Real-time vote count display
- Maximum vote cap per theme
- First-come-first-serve voting system
- One vote per person

## Prerequisites

- Node.js 18+ installed
- Vercel account (for deployment)
- Vercel Postgres database

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory with:

   ```
   POSTGRES_URL="your-vercel-postgres-url"
   ```

4. Push the database schema:

   ```bash
   npx prisma db push
   ```

5. Seed the database with initial themes:

   ```bash
   npx ts-node src/scripts/seed.ts
   ```

6. Run the development server:

```bash
npm run dev
```

## Deployment

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:

   ```bash
   vercel
   ```

3. Follow the prompts to deploy your application

## Usage

1. Visit the application URL
2. Enter your name
3. Select an available theme
4. Submit your vote
5. The system will automatically update to show current vote counts

## Technical Details

- Built with Next.js 14 and TypeScript
- Uses Prisma as ORM
- Vercel Postgres for database
- Tailwind CSS for styling
- Real-time vote tracking
- Automatic theme removal when max votes reached
