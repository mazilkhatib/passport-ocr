# Frontend Application

This is the frontend application built with React, TypeScript, Vite, and Tailwind CSS.

## Prerequisites

Before you begin, ensure you have:
- Node.js (version 18 or higher recommended)
- npm (comes with Node.js)

## Tech Stack

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for UI components

## Setup and Installation

1. Navigate to the frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173`

## Project Structure
```
├── src/
│   ├── components/          # React components
│   │   ├── PassportScanner.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── PassportInformation.tsx
│   │   ├── PlaceHolderContent.tsx
│   │   └── ui/             # UI components
│   │       ├── alert.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── assets/            # Static assets
│   │   └── react.svg
│   ├── App.tsx            # Root component
│   ├── App.css            # App-specific styles
│   ├── main.tsx           # Entry point
│   ├── index.css          # Global styles
│   └── vite-env.d.ts      # Vite environment types
├── public/                # Public assets
│   └── vite.svg
├── components.json        # shadcn/ui components config
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript Node configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Project dependencies and scripts
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## TypeScript Configuration

The project includes several TypeScript configuration files:
- `tsconfig.json`: Base TypeScript configuration
- `tsconfig.app.json`: Application-specific configuration
- `tsconfig.node.json`: Node-specific configuration

## Styling

This project uses Tailwind CSS for styling. The configuration can be found in:
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration

### UI Components

The project uses shadcn/ui components located in `src/components/ui/`. These are pre-built, customizable components that follow Tailwind CSS practices.

## Development Tips

1. **TypeScript**:
    - Enable TypeScript checking in your IDE
    - Run `npm run type-check` before commits
    - Use proper type definitions for components and functions

2. **Tailwind CSS**:
    - Use Tailwind CSS utility classes for styling
    - Check `tailwind.config.js` for custom configurations
    - Utilize the shadcn/ui components from `components/ui`

3. **Components**:
    - Place reusable components in `src/components`
    - UI components are in `src/components/ui`
    - Utilize TypeScript interfaces for props

## Troubleshooting

1. **Dependencies Issues**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

2. **Type Errors**:
```bash
# Run type checking
npm run type-check
```

3. **Build Issues**:
```bash
# Clean and rebuild
rm -rf dist
npm run build
```

## Environment Variables

Create a `.env` file in the root directory for environment variables:
```env
VITE_API_ENDPOINT=http://localhost:8000
```

Note: All environment variables must be prefixed with `VITE_` to be accessible.

## Code Style

- Use TypeScript for type safety
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Utilize shadcn/ui components when possible
- Keep components small and focused
- Use proper TypeScript types and interfaces
