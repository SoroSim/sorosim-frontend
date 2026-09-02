# SoroSim Frontend

[![CI](https://github.com/SoroSim/sorosim-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/SoroSim/sorosim-frontend/actions/workflows/ci.yml)

Browser-based Soroban contract simulation and dry-run sandbox with visual state inspector.

## Features

- 🚀 **WASM Upload**: Drag & drop or paste contract WASM files
- 🔍 **Function Discovery**: Automatic contract entry point detection
- ⚙️ **Mock Ledger**: Configure custom ledger state for simulations
- 📊 **Visual State Inspector**: View state changes with color-coded diffs
- 🎯 **Invocation Testing**: Test contract functions without deploying
- 📝 **Event Viewer**: Inspect emitted contract events
- 💾 **Session Management**: Save and share simulation sessions
- ♿ **Accessible**: ARIA labels, keyboard navigation, screen reader support
- 📱 **Responsive**: Optimized for desktop, tablet, and mobile devices
- 🧪 **Tested**: Comprehensive unit test coverage with Vitest

## Tech Stack

- **Framework**: React 19 + TypeScript 6
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v3
- **Testing**: Vitest + Testing Library
- **Linting**: Oxlint
- **Code Editor**: Monaco Editor
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
sorosim-frontend/
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
├── src/
│   ├── api/             # Backend API integration
│   ├── components/      # React components (20+ components)
│   │   ├── ContractPanel.tsx
│   │   ├── InvocationPanel.tsx
│   │   ├── StatePanel.tsx
│   │   ├── ArgumentForm.tsx
│   │   ├── StateDiffViewer.tsx
│   │   ├── ContractEventsViewer.tsx
│   │   └── ...
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   │   ├── wasmParser.ts
│   │   ├── sessionManager.ts
│   │   ├── urlStateManager.ts
│   │   └── cliFormatter.ts
│   ├── test/            # Test setup and utilities
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── dist/                # Production build output
├── index.html           # HTML template
├── vite.config.ts       # Vite + Vitest configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── package.json         # Dependencies and scripts
└── PROGRESS.md          # Development progress tracker
```

## Roadmap

✅ All 25 commits completed! See [PROGRESS.md](./PROGRESS.md) for the full development roadmap including:
- WASM upload and function discovery
- Dynamic argument forms with type support
- Mock ledger state management
- Visual state diff viewer
- Contract events inspection
- Invocation history and replay
- Session export/import and URL sharing
- Monaco editor for advanced editing
- Contract presets (token, counter, voting, NFT)
- Settings panel and network configuration
- CLI output preview mode
- Accessibility improvements
- Responsive design for tablets
- Comprehensive test coverage
- CI/CD with GitHub Actions

## CI/CD

This project uses GitHub Actions for continuous integration:
- **Lint**: Code quality checks with Oxlint
- **Build**: Multi-Node (20, 22) matrix builds
- **Test**: Unit tests with Vitest across Node versions
- **Type Check**: TypeScript compilation verification

**Node.js Requirements**: Node 20+ required due to Vite 8 and Vitest 4 dependencies.

All checks must pass before merging pull requests.

## Contributing

Contributions welcome! This is an open-source project for the Stellar ecosystem.

## License

MIT
