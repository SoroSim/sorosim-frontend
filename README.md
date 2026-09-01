# SoroSim Frontend

Browser-based Soroban contract simulation and dry-run sandbox with visual state inspector.

## Features

- 🚀 **WASM Upload**: Drag & drop or paste contract WASM files
- 🔍 **Function Discovery**: Automatic contract entry point detection
- ⚙️ **Mock Ledger**: Configure custom ledger state for simulations
- 📊 **Visual State Inspector**: View state changes with color-coded diffs
- 🎯 **Invocation Testing**: Test contract functions without deploying
- 📝 **Event Viewer**: Inspect emitted contract events
- 💾 **Session Management**: Save and share simulation sessions

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Linting**: Oxlint

## Getting Started

### Prerequisites

- Node.js 18+ and npm

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

## Project Structure

```
sorosim-frontend/
├── src/
│   ├── components/       # React components
│   │   ├── ContractPanel.tsx
│   │   ├── InvocationPanel.tsx
│   │   └── StatePanel.tsx
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies
```

## Roadmap

See the full development roadmap with 25 commits covering features from basic upload to CI/CD.

## Contributing

Contributions welcome! This is an open-source project for the Stellar ecosystem.

## License

MIT
