# Ministack UI

Ministack UI is a modern, open-source dashboard for managing simulated AWS services. It provides a user-friendly interface to interact with [Ministack](https://github.com/Nahuel990/ministack), an alternative to LocalStack designed for efficient local development and "vibe coding."

![Ministack Dashboard](./src/assets/hero.png)

## 🚀 Features

- **Service Management**: View and interact with simulated AWS services.
- **S3 Bucket Manager**: List buckets, browse objects, and upload files.
- **DynamoDB Explorer**: View tables and edit items using a JSON editor.
- **Secrets Manager**: Manage your local secrets.
- **SQS & SNS**: Monitor and interact with message queues and notification topics.
- **Real-time Feedback**: Built-in toast notifications and loading states.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AWS SDK**: [@aws-sdk/client-\*](https://aws.amazon.com/sdk-for-javascript/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [Ministack](https://github.com/Nahuel990/ministack) running locally (typically at `http://localhost:4566`)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ministack-front.git
   cd ministack-front
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the project and builds for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run format`: Formats code using Prettier.
- `npm run test`: Starts the Vitest test runner.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details (if available).
