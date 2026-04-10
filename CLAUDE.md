# CLAUDE.md - Ministack Front-End GUI

@UI_GUIDELINES.md

Ministack is an open-source alternative to LocalStack. This project provides a web-based GUI for interacting with the AWS services emulated by Ministack.

## Project Structure

- `src/`: React source code
- `src/components/`: Reusable UI components
- `src/services/`: API clients for interacting with Ministack (port 4566)
- `src/pages/`: Main views for each AWS service
- `src/hooks/`: Custom React hooks for data fetching and state management

## Technology Stack

- **Framework:** React (Vite)
- **Testing:** Vitest + React Testing Library
- **Styling:** Tailwind CSS
- **Formatting:** Prettier
- **Linting:** ESLint (with TypeScript and Prettier plugins)
- **Icons:** Lucide React (standardized)
- **API Client:** AWS SDK for JavaScript (v3)

## Coding Standards

- **Component Style:** Functional components with Hooks
- **State Management:** React Context or local state where possible; avoid heavy state managers unless necessary.
- **API Integration:** Use `@aws-sdk/client-*` libraries configured to point to `http://localhost:4566`.
- **Naming Conventions:**
  - Files: `PascalCase` for components, `camelCase` for utilities/hooks.
  - Variables/Functions: `camelCase`.
- **Types:** Strictly use TypeScript. Avoid `any`. Use `unknown` in catch blocks with type guards.
- **Formatting:** Code must be formatted with Prettier.

- **Hook & Context Stability:**
  - Memoize context values and hook return values using `useMemo` or `useCallback` to avoid unnecessary re-renders in consumers.
  - For common hooks (like `useToast`), return stable objects so they can be safely used in `useEffect` dependency arrays.
  - Consider splitting context state from context actions to avoid re-rendering consumers that only need to trigger actions.

## Testing Strategy

- **Unit/Component Tests:** Use Vitest and React Testing Library in `src/test/`.
- **Command:** `npm run test` or `npm run test:run`.

## Development Workflow

1. Start Ministack: `docker run -p 4566:4566 nahuelnucera/ministack`
2. Run front-end: `npm run dev`
3. Verify changes against the local Ministack endpoint.
4. Pre-commit hooks automatically run lint/format/tests: `npx lint-staged` and `npm run test:run`.
