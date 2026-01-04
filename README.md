🤖 AI-SmartSupport

AI-SmartSupport is an AI-powered customer support ticket management system designed to automatically analyze, prioritize, and assign support tickets using modern backend engineering and AI-driven workflows.

This project is inspired by the ChaiCode YouTube video series and focuses on demonstrating real-world backend architecture, event-driven systems, and AI integration.

📌 Project Overview

AI-SmartSupport automates the support ticket lifecycle by leveraging AI to:

Analyze ticket content intelligently

Assign priority based on issue context

Match tickets to the most suitable moderators using skill-based routing

Generate helpful notes to speed up resolution

The system is built with a scalable, event-driven backend architecture, reflecting industry-standard practices.

🚀 Key Features
🧠 AI-Powered Ticket Processing

Automatic ticket categorization

Smart priority assignment

AI-generated helpful notes for moderators

Skill extraction from ticket content

👥 Smart Moderator Assignment

Skill-based routing using regex matching

Automatic moderator selection

Admin fallback if no matching moderator is found

🔐 User Management

Role-based access control (User, Moderator, Admin)

Moderator skill management

Secure JWT-based authentication

⚙️ Background & Asynchronous Processing

Event-driven architecture using Inngest

Non-blocking ticket processing

Automated email notifications

🛠️ Tech Stack

Backend: Node.js, Express

Database: MongoDB

Authentication: JWT

Background Jobs: Inngest

AI Integration: Google Gemini API

Email Service: Nodemailer (Mailtrap for testing)

Development Tools: Nodemon

🔄 System Workflow (High-Level)

Ticket Creation

User submits a ticket with title and description

AI Analysis

AI analyzes ticket content

Determines priority, required skills, and helpful notes

Assignment Logic

System matches ticket skills with moderator skills

Falls back to admin if no match is found

Notification

Assigned moderator receives an email notification

🚀 Quick Start
npm install
npm run dev


The application runs as a Node.js backend service with background job processing handled by Inngest.

📚 Dependencies (Core)

express

mongoose

jsonwebtoken

inngest

@inngest/agent-kit

nodemailer

bcrypt

dotenv

cors

🎯 Why This Project Matters

This project demonstrates:

Real-world backend system design

Practical AI integration (not just API calls)

Event-driven architecture with background jobs

Clean separation of concerns (controllers, models, utils, workflows)

Production-oriented thinking suitable for internships and entry-level backend roles

🙏 Acknowledgments

Inngest — Background job processing

Google Gemini — AI capabilities

Mailtrap — Email testing

MongoDB — Database
