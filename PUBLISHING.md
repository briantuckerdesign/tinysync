# Publishing Guide for tinysync Monorepo

This guide covers the workflow for maintaining and publishing the tinysync monorepo packages to npm.

## Monorepo Structure

```
tinysync/
├── packages/
│   ├── core/           # @tinysync/core - Core sync functionality
│   └── cli/            # @tinysync/cli - Command-line interface
├── package.json        # Root workspace configuration
└── PUBLISHING.md       # This file
```

## Setup

### Initial Setup

1. **Install dependencies:**

    ```bash
    bun install
    ```

2. **Build all packages:**

    ```bash
    bun run build
    ```

3. **Login to npm:**
    ```bash
    npm login
    ```

## Development Workflow

### Working on Packages

1. **Make changes to core package:**

    ```bash
    cd packages/core
    # Edit files
    bun run build
    bun test
    ```

2. **Make changes to CLI package:**

    ```bash
    cd packages/cli
    # Edit files
    bun run build
    bun test
    ```

3. **Run CLI in development:**
    ```bash
    # From root
    bun run start
    # or
    bun --filter @tinysync/cli start
    ```

### Testing Changes

- **Test core package:**

    ```bash
    bun run test:core
    ```

- **Test CLI package:**

    ```bash
    bun run test:cli
    ```

- **Test all packages:**
    ```bash
    bun test
    ```

## Versioning

### Version Strategy

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Updating Versions

**Option 1: Manual versioning** (recommended for independent package versions)

1. Update version in `packages/core/package.json`
2. Update version in `packages/cli/package.json`
3. Update version in root `package.json`

**Option 2: Synchronized versioning** (easier for coordinated releases)

Since the CLI depends on core, you typically want to keep versions in sync:

```bash
# For a patch release (0.7.0 → 0.7.1)
# Update all three package.json files manually

# For a minor release (0.7.0 → 0.8.0)
# Update all three package.json files manually

# For a major release (0.7.0 → 1.0.0)
# Update all three package.json files manually
```

**Version Update Script** (you can create this):

```bash
# Create a version-bump script
cat > scripts/version-bump.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./version-bump.sh <patch|minor|major>"
  exit 1
fi

# Get current version from root package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Calculate new version
case $1 in
  patch)
    NEW_VERSION=$(node -p "require('semver').inc('$CURRENT_VERSION', 'patch')")
    ;;
  minor)
    NEW_VERSION=$(node -p "require('semver').inc('$CURRENT_VERSION', 'minor')")
    ;;
  major)
    NEW_VERSION=$(node -p "require('semver').inc('$CURRENT_VERSION', 'major')")
    ;;
  *)
    echo "Invalid bump type: $1"
    exit 1
    ;;
esac

echo "Bumping version from $CURRENT_VERSION to $NEW_VERSION"

# Update all package.json files
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" packages/core/package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" packages/cli/package.json

echo "Version updated to $NEW_VERSION"
EOF

chmod +x scripts/version-bump.sh
```

## Publishing to npm

### Pre-Publishing Checklist

- [ ] All tests pass (`bun test`)
- [ ] Code is committed to git
- [ ] Version numbers are updated
- [ ] CLI builds successfully (`bun run build`)
- [ ] CHANGELOG is updated (if you maintain one)
- [ ] README files are up to date

### Publishing Process

**Option 1: Publish both packages together**

```bash
# Build CLI (core ships raw TypeScript, no build needed)
bun run build

# Publish core first (since CLI depends on it)
bun run publish:core

# Wait for npm to update (~1-2 minutes), then publish CLI
bun run publish:cli
```

**Option 2: Publish individually**

```bash
# Publish core (no build needed - ships TypeScript source)
cd packages/core
npm publish --access public

# Wait a minute for npm to update the registry
# Then publish CLI
cd ../cli
bun run build
npm publish --access public
```

**Note:** Core package ships raw TypeScript and requires Bun to use.

### Important Notes

1. **@tinysync scope**: The `@tinysync` scope must be available to you on npm. If this is your first time publishing, you may need to:

    ```bash
    npm login
    # Create the organization on npmjs.com or change to your own scope
    ```

2. **Public access**: Both packages use `--access public` because scoped packages are private by default on npm.

3. **Dependency resolution**: After publishing core, wait 1-2 minutes before publishing CLI to ensure npm's registry has updated.

4. **Workspace protocol**: In CLI's package.json, we use `"@tinysync/core": "workspace:*"`. When you run `npm publish`, this automatically resolves to the current version number.

## Post-Publishing

After successfully publishing:

1. **Create a git tag:**

    ```bash
    git tag -a v0.7.0 -m "Release v0.7.0"
    git push origin v0.7.0
    ```

2. **Create a GitHub release:**
    - Go to your repository on GitHub
    - Click "Releases" → "Draft a new release"
    - Select your tag
    - Add release notes
    - Attach the compiled CLI binary if desired

3. **Verify packages are published:**

    ```bash
    npm view @tinysync/core
    npm view @tinysync/cli
    ```

4. **Test installation:**
    ```bash
    # In a different directory
    npm install @tinysync/core
    npm install -g @tinysync/cli
    tinysync
    ```

## Troubleshooting

### "You must be logged in to publish packages"

```bash
npm login
```

### "You do not have permission to publish @tinysync/core"

You need access to the `@tinysync` scope. Either:

- Create the scope on npmjs.com
- Change the scope to one you own
- Request access from the scope owner

### "Cannot publish over existing version"

You forgot to bump the version number. Update package.json versions and try again.

### CLI can't find core package

Make sure:

1. Core was published successfully
2. You waited for npm to update (~1-2 minutes)
3. The version in CLI's package.json matches the published core version

### Workspace dependency issues

If you see `workspace:*` in your published package on npm, you didn't run `npm publish` correctly. The workspace protocol should be automatically resolved during publishing.

## Maintenance Tips

1. **Keep versions in sync**: Since CLI depends on core, keeping both at the same version makes maintenance easier.

2. **Test locally first**: Before publishing, test the CLI binary locally:

    ```bash
    cd packages/cli
    bun run build:binary
    ./dist/tinysync
    ```

3. **Document breaking changes**: If you make breaking changes to core, ensure CLI is updated before publishing.

4. **Automate if needed**: Consider setting up GitHub Actions for automated publishing on tag push.

5. **Beta releases**: For testing, you can publish beta versions:
    ```bash
    # Update version to 0.8.0-beta.1
    npm publish --tag beta
    ```

## Quick Reference

```bash
# Development
bun install              # Install dependencies
bun run build           # Build all packages
bun test                # Run all tests
bun run start           # Run CLI in dev mode

# Publishing
bun run build           # Build all packages
bun run publish:core    # Publish core to npm
bun run publish:cli     # Publish CLI to npm
bun run publish:all     # Build and publish both

# Version bumping (after creating script)
./scripts/version-bump.sh patch   # 0.7.0 → 0.7.1
./scripts/version-bump.sh minor   # 0.7.0 → 0.8.0
./scripts/version-bump.sh major   # 0.7.0 → 1.0.0
```

## Additional Resources

- [npm Publishing Documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
