# Reggie AI

A powerful multi-agent platform for corporate compliance, built with Next.js and Django.

![Reggie AI Screenshot](/placeholder.svg?height=400&width=800)

## Overview

Reggie AI is an intelligent compliance assistant that helps organizations navigate complex regulatory requirements, manage compliance documentation, and stay up-to-date with changing regulations. Leveraging multiple specialized AI agents, Reggie provides comprehensive compliance support across various domains.

## Features

- 🤖 Multiple specialized AI agents for different compliance domains
- 📊 Compliance dashboard with status tracking and alerts
- 📝 Document analysis and compliance checking
- 🔒 Secure JWT authentication and role-based access control
- 📚 Regulatory knowledge base and updates
- 📋 Compliance task management and reminders
- 📱 Fully responsive design for desktop and mobile
- 🌙 Dark/light mode support

## AI Agents

Reggie AI includes several specialized agents:

- **Policy Advisor** - Reviews and suggests improvements to company policies
- **Regulatory Monitor** - Tracks regulatory changes in your industry
- **Document Analyzer** - Scans documents for compliance issues
- **Risk Assessor** - Identifies potential compliance risks
- **Training Assistant** - Helps create compliance training materials

## Tech Stack

### Frontend
- **Next.js** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Vercel** - Deployment

### Backend
- **Django** - Python web framework
- **Django REST Framework** - API development
- **Simple JWT** - JWT authentication
- **PostgreSQL** - Database
- **OpenAI API** - AI integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL (recommended for production)
- OpenAI API key

### Documentation

- [Sentry Integration Setup](docs/sentry-setup.md) - Error tracking and monitoring configuration
- [URL Safety Utility](docs/url-safety.md) - Security guidelines for URL handling

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/norfolkpine/reggie-frontend.git
   cd reggie-frontend