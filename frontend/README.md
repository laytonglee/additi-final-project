# Additi — Frontend

A Next.js 15 frontend for the Additi freelance platform, connecting clients and freelancers.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Real-time**: STOMP/SockJS WebSocket
- **HTTP**: Axios with `withCredentials` (HttpOnly cookie auth)

## Getting Started

Copy the environment file and fill in your values:

```bash
cp .env.example .env.local
```

Then run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:8080`) |
| `NEXT_PUBLIC_APP_URL` | Frontend base URL |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Cloudflare R2 public CDN URL for file attachments |

## Deployment

Deployed on **Vercel**. Set `NEXT_PUBLIC_API_URL` to the production backend URL in your Vercel environment variables.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
