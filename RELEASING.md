# Releasing tinysync

This guide covers how to release new versions of the tinysync packages.

## Prerequisites

- [GitHub CLI](https://cli.github.com/) installed (`brew install gh`)
- npm publish access to `@tinysync` scope
- Repository write access

## Release Process

### 1. Update Version Numbers

Update the version in the relevant `package.json` files:

```bash
# For CLI releases
packages/cli/package.json

# For core releases
packages/core/package.json
```

### 2. Build and Test

```bash
# Install dependencies
bun install

# Build the CLI (creates JS bundle + platform binaries)
cd packages/cli
bun run build

# Run tests
bun test
```

### 3. Publish to npm

The npm package only includes the JS bundle (not binaries):

```bash
cd packages/cli
npm pack --dry-run
npm publish --access public
```

### 4. Create GitHub Release

Create a GitHub release to trigger the binary build workflow:

```bash
# Create and push a tag
git tag v1.0.8
git push origin v1.0.8

# Create the release (this triggers the workflow)
gh release create v1.0.8 --title "v1.0.8" --notes "Release notes here"
```

Or create the release via the [GitHub web UI](https://github.com/briantuckerdesign/tinysync/releases/new).

The GitHub Actions workflow will automatically:

- Build binaries for all platforms (macOS, Linux, Windows)
- Create archives (`.tar.gz` for Unix, `.zip` for Windows)
- Generate SHA256 checksums
- Upload all assets to the release

### 5. Verify Release Assets

After the workflow completes, the release should have:

| File                           | Description                       |
| ------------------------------ | --------------------------------- |
| `tinysync-darwin-arm64.tar.gz` | macOS Apple Silicon               |
| `tinysync-darwin-x64.tar.gz`   | macOS Intel                       |
| `tinysync-linux-arm64.tar.gz`  | Linux ARM64                       |
| `tinysync-linux-x64.tar.gz`    | Linux x64                         |
| `tinysync-windows-x64.zip`     | Windows x64                       |
| `tinysync-local-*.tar.gz/zip`  | Local dev versions (TLS disabled) |
| `checksums.txt`                | SHA256 checksums for all files    |

## Verifying Downloads (for users)

Users can verify their download integrity using the checksums:

```bash
# Download the release and checksums
curl -LO https://github.com/briantuckerdesign/tinysync/releases/latest/download/tinysync-darwin-arm64.tar.gz
curl -LO https://github.com/briantuckerdesign/tinysync/releases/latest/download/checksums.txt

# Verify on macOS
shasum -a 256 -c checksums.txt --ignore-missing

# Verify on Linux
sha256sum -c checksums.txt --ignore-missing
```

## Deprecating a Version

If a version has critical bugs:

```bash
npm deprecate @tinysync/cli@1.0.3 "This version has a critical bug, please upgrade"
```

## Platform Binaries

The build script creates standalone executables for:

| Platform | Architecture          | Binary Path                     |
| -------- | --------------------- | ------------------------------- |
| macOS    | ARM64 (Apple Silicon) | `dist/mac/arm64/tinysync`       |
| macOS    | x64 (Intel)           | `dist/mac/x64/tinysync`         |
| Linux    | ARM64                 | `dist/linux/arm64/tinysync`     |
| Linux    | x64                   | `dist/linux/x64/tinysync`       |
| Windows  | x64                   | `dist/windows/x64/tinysync.exe` |

Each platform also has a `-local` variant with TLS verification disabled (for corporate VPN/proxy environments).
