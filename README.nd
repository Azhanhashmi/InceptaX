<div align="center">

# InceptaX

### Build • Submit • Get Ranked

A full-stack hackathon platform that enables developers to participate in coding challenges, submit projects, receive AI-assisted evaluations, collaborate with teammates, and compete on challenge-specific and global leaderboards.

</div>

---

# Table of Contents

- Overview
- Features
- Tech Stack
- Project Structure
- Database Models
- Authentication
- OTP Verification
- AI Evaluation
- Admin Portal
- Subscription Plans
- Team Collaboration & Chat
- Leaderboards
- Email System
- API Reference
- Environment Variables
- Getting Started
- Deployment

---

# Overview

InceptaX is a hackathon and project evaluation platform designed for developers. Participants can browse challenges, submit GitHub repositories, collaborate with teammates, and receive detailed AI-generated feedback.

An independent admin portal manages challenge creation, submission reviews, evaluation workflows, user management, and result publication.

AI-generated evaluations never appear directly to users. Every evaluation must be reviewed and approved by an administrator before publication.

---

# Features

## User Features

- Firebase Authentication
  - Google
  - GitHub
  - Email & Password

- Email OTP Verification

- Challenge Discovery
  - Difficulty filtering
  - Free and Premium challenge support

- Project Submission
  - GitHub repository URL
  - Live demo URL
  - Project description

- Team Collaboration
  - Invite members by username
  - Shared project submissions

- Real-Time Team Chat
  - Socket.io powered messaging

- Public Developer Profiles
  - Unique profile URLs
  - Shareable portfolio pages

- Leaderboards
  - Global rankings
  - Challenge-specific rankings

- Subscription Plans

---

## Admin Features

- Separate Admin Authentication
- Challenge Management
- AI Evaluation Controls
- Submission Review Workflow
- User Management
- Email Campaign System
- Analytics Dashboard
- Manual Plan Management

---

# Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| User Authentication | Firebase Authentication |
| Admin Authentication | JWT + bcrypt |
| AI Evaluation | OpenAI GPT-4o / GPT-4.1 |
| GitHub Integration | GitHub REST API |
| Real-Time Communication | Socket.io |
| Email Service | Nodemailer |

---

# Project Structure

```text
inceptax/

├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

# Database Models

## User

```js
{
  firebaseUid,
  username,
  email,
  plan,
  expiresAt
}
```

## Assignment

```js
{
  title,
  description,
  difficulty,
  premiumOnly,
  requiredPlan
}
```

## Submission

```js
{
  assignment,
  owner,
  githubRepo,
  demoUrl,
  description,
  aiScore,
  adminScore,
  status
}
```

## TeamMessage

```js
{
  submission,
  sender,
  content,
  createdAt
}
```

## OTP

```js
{
  email,
  code,
  expiresAt
}
```

---

# Authentication

## User Authentication

Firebase Authentication is used for:

- Google Sign-In
- GitHub Sign-In
- Email & Password Authentication

All protected user routes validate Firebase ID tokens.

## Admin Authentication

Admins use a completely separate authentication system:

- Email & Password Login
- bcrypt Password Hashing
- JWT Access Tokens
- Separate JWT Secret

Admin accounts are isolated from Firebase.

---

# OTP Verification

New users verify their email addresses using a 6-digit OTP.

Workflow:

1. User registers
2. OTP is generated
3. OTP is emailed
4. User submits code
5. Account becomes verified

OTP documents automatically expire using MongoDB TTL indexes.

---

# AI Evaluation

The evaluation workflow consists of:

1. User submits project
2. Admin triggers AI evaluation
3. OpenAI analyzes repository content
4. Evaluation report is generated
5. Admin reviews results
6. Admin publishes or rejects

Published results become visible to users.

---

# Admin Portal

## Routes

| Route | Purpose |
|---------|---------|
| /admin-portal/login | Admin Login |
| /admin-portal | Dashboard |
| /admin-portal/challenges | Challenge Management |
| /admin-portal/submissions | Submission Reviews |
| /admin-portal/users | User Management |
| /admin-portal/email | Email Campaigns |

---

## Submission Workflow

```text
pending
   ↓
ai_evaluated
   ↓
admin_reviewed
   ↓
published
```

Rejected submissions exit the workflow and do not appear publicly.

---

# Subscription Plans

| Plan | Price | Duration |
|--------|---------|---------|
| Free | ₹0 | Unlimited |
| Sprint | ₹199 | 10 Days |
| Pro | ₹499 | 30 Days |

Premium plans unlock:

- Premium Challenges
- Team Collaboration
- Real-Time Chat
- Additional Submission Features

---

# Team Collaboration & Chat

Premium users can:

- Invite teammates
- Share submissions
- Collaborate through real-time messaging
- Access submission-specific chat rooms

Message history is stored in MongoDB.

---

# Leaderboards

## Global Leaderboard

Ranks users using:

- Best Project Score
- Published Submissions
- Average Evaluation Score

---

## Challenge Leaderboard

Ranks submissions within a single challenge.

Ranks are automatically recalculated when new results are published.

---

# Email System

Nodemailer is used for all outgoing emails.

## Automated Emails

- Welcome Email
- OTP Verification
- Plan Activation

## Admin Campaigns

Administrators can send HTML email campaigns to:

- All Users
- Free Users
- Sprint Users
- Pro Users

All sent emails are logged for auditing.

---

# API Reference

## Challenges

| Method | Endpoint |
|----------|-----------|
| GET | /api/assignments |
| GET | /api/assignments/:id |

---

## Submissions

| Method | Endpoint |
|----------|-----------|
| POST | /api/submissions |
| GET | /api/submissions/mine |
| GET | /api/submissions/:id |

---

## Leaderboards

| Method | Endpoint |
|----------|-----------|
| GET | /api/leaderboard |
| GET | /api/leaderboard/assignment/:id |

---

## Plans

| Method | Endpoint |
|----------|-----------|
| GET | /api/plans |
| POST | /api/plans/upgrade |

---

## OTP

| Method | Endpoint |
|----------|-----------|
| POST | /api/otp/send |
| POST | /api/otp/verify |

---

# Environment Variables

## Backend

```env
PORT=5000

MONGO_URI=

JWT_SECRET=
ADMIN_JWT_SECRET=

OPENAI_API_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Frontend

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/inceptax.git

cd inceptax
```

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Deployment

## Frontend

Recommended platforms:

- Vercel
- Netlify

## Backend

Recommended platforms:

- Railway
- Render
- Fly.io
- AWS

## Database

- MongoDB Atlas

## Production Checklist

- Configure environment variables
- Enable Firebase Authentication providers
- Configure SMTP credentials
- Configure OpenAI API key
- Configure MongoDB Atlas access rules
- Configure HTTPS

---

# License

MIT License

Copyright (c) 2026 InceptaX
