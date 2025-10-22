# Contributing to LibreFood

Thank you for your interest in contributing to LibreFood! We're building a free, open-source, evidence-based nutrition tracking app, and we welcome contributions from everyone.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (see CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/YOUR_USERNAME/smarttracker/issues)
2. If not, create a new issue using the Bug Report template
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Device/OS information

### Suggesting Features

1. Check if the feature has already been requested
2. Create a new issue using the Feature Request template
3. Explain:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives you've considered

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** from `develop`
```bash
   git checkout -b feature/your-feature-name
```
3. **Make your changes**
   - Follow the existing code style
   - Write tests for new functionality
   - Update documentation as needed
4. **Run tests and linting**
```bash
   npm test
   npm run lint
   npm run tsc --noEmit
```
5. **Commit your changes**
   - Use conventional commit format: `type(scope): description`
   - Types: feat, fix, docs, test, refactor, chore
   - Example: `feat(tdee): add Katch-McArdle calculator`
6. **Push to your fork**
```bash
   git push origin feature/your-feature-name
```
7. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Ensure all tests pass
   - Wait for review

## Development Setup

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed setup instructions.

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write JSDoc comments for public functions
- No `any` types unless absolutely necessary

## Testing Requirements

- Unit tests for all utility functions and calculations
- Integration tests for database operations
- Component tests for UI components
- Aim for >80% code coverage

## Documentation

- Update relevant docs when adding features
- Keep SPEC.md as source of truth
- Document breaking changes in CHANGELOG.md
- Add JSDoc comments to public APIs

## Questions?

Feel free to:
- Open an issue for discussion
- Join our community (Discord/Slack - link coming soon)
- Email: [your-email@example.com]

Thank you for contributing! 🎉
