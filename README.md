# RemindAI - WhatsApp & Telegram AI SaaS

RemindAI is a professional, AI-powered reminder service that seamlessly integrates with WhatsApp and Telegram. Built with a modern tech stack, it allows users to set reminders using natural language and ensures reliable delivery through background job processing.

## 🚀 Features

- **Multi-Platform Integration**: Set and receive reminders directly on WhatsApp (via Twilio) and Telegram.
- **Natural Language Parsing**: Uses OpenAI GPT-4o-mini to understand complex reminder requests like "remind me to call mom tomorrow at 7pm".
- **Reliable Scheduling**: Powered by BullMQ and Redis for robust background job processing and guaranteed delivery.
- **Persistent Storage**: Centralized data management using Supabase (PostgreSQL).
- **Subscription Management**: Integrated with Razorpay for automated billing and tier management (Free vs. Premium).
- **Modern Admin Dashboard**: Comprehensive management interface for users, reminders, and system logs with a built-in "Demo Mode" for easy setup.
- **Responsive Landing Page**: High-conversion SaaS landing page built with Next.js 15 and Tailwind CSS.

## 🛠️ Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/)
- **Job Queue**: [BullMQ](https://docs.bullmq.io/) with [IORedis](https://github.com/luin/ioredis)
- **Redis Provider**: [Upstash](https://upstash.com/)
- **AI/LLM**: [OpenAI](https://openai.com/) (GPT-4o-mini)
- **Messaging**: [Twilio](https://www.twilio.com/) (WhatsApp) & [Telegram Bot API](https://core.telegram.org/bots/api)
- **Payments**: [Razorpay](https://razorpay.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase project
- An Upstash Redis instance
- Twilio & Telegram Bot credentials
- OpenAI API Key
- Razorpay account

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd RemindAI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   *Note: The Admin Dashboard will run in **Demo Mode** if Supabase keys are missing.*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Initialize Database**:
   Apply the SQL migration found in `supabase/migrations/20260112_initial_schema.sql` to your Supabase SQL Editor.

## 🛡️ Security & Privacy

- **Protected Admin Routes**: Middleware-based protection for all administrative interfaces.
- **Defensive Service Integration**: Robust null checks and error handling for all external API connections.
- **Data Privacy**: Users only receive reminders they've explicitly set.

## 📈 Roadmap

- [ ] Voice note transcription for reminders.
- [ ] Multi-language support for intent parsing.
- [ ] Advanced recurrence rules (bi-weekly, specific days).
- [ ] Team/Shared reminders.

## 📄 License

This project is private and intended for internal use.
