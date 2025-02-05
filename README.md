# Notatdelingsplattform 

## Development

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd notatdelingsplattform
   ```

2. Open the project in VS Code:
   ```bash
   code .
   ```

3. When prompted, click "Reopen in Container" or press `F1`, type "Dev Containers: Reopen in Container" and press Enter.

The dev container will automatically:
- Install all necessary VS Code extensions
- Set up Node.js 20 environment
- Install Firebase CLI
- Install all frontend dependencies
- Configure git for the workspace

### Development Environment

The development environment includes:

- React + Vite frontend setup under `/frontend`
- Firebase backend configuration
- TailwindCSS for styling
- ESLint for code linting
- TypeScript support

### Available Commands

From the `/frontend` directory:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Firebase Commands

The Firebase CLI is pre-installed in the dev container. Common commands:

```bash
# Initialize Firebase in the project
firebase init

# Deploy to Firebase
firebase deploy

# Start Firebase emulators
firebase emulators:start
```

### VS Code Extensions

The following extensions are automatically installed in the dev container:

- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag
- ES7+ React/Redux/React-Native snippets
- Path Intellisense
- DotENV
- Firebase
- Vite
- Error Lens

### Ports

The development server runs on port 5173 and is automatically forwarded from the container to your host machine.

### Troubleshooting

If you encounter any issues:

1. Rebuild the dev container: 
   - Press F1
   - Type "Dev Containers: Rebuild Container" and press Enter

2. Verify Docker is running on your system

3. Check that all required VS Code extensions are installed

4. If npm installations fail, try removing the `node_modules` folder and running `npm install` again within the container