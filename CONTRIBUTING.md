# Contributing to LETS_PREP

First off, thank you for considering contributing to LETS_PREP! It's people like you that make LETS_PREP such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code based on the Documentation Styleguide
* End all files with a newline

## Development Process

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/LETS_PREP_.git
cd LETS_PREP_
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes

* Write clean, readable code
* Follow existing code style
* Add tests for new features
* Update documentation as needed

### 4. Test Your Changes

```bash
# Frontend
cd Frontend
npm run lint
npm run build

# Backend
cd Backend
npm run lint
npm run build
```

### 5. Commit Your Changes

Follow conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update README"
git commit -m "style: format code"
git commit -m "refactor: restructure module"
git commit -m "test: add unit tests"
git commit -m "chore: update dependencies"
```

### 6. Push & Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for all new code
* Use meaningful variable names
* Add type annotations where TypeScript can't infer
* Prefer `const` over `let`, avoid `var`
* Use async/await over promises where possible
* Document complex functions with JSDoc comments

### Component Styleguide

* Use functional components with hooks
* Keep components small and focused
* Extract reusable logic into custom hooks
* Use proper prop types
* Add comments for complex logic

## Project Structure

```
Frontend/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # Base UI components
│   └── ...          # Feature components
├── lib/             # Utilities and helpers
└── styles/          # Global styles

Backend/
├── src/
│   ├── routes/      # API routes
│   ├── controllers/ # Request handlers
│   ├── services/    # Business logic
│   └── utils/       # Utilities
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
