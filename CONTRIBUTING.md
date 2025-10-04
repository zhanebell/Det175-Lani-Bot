# Contributing to Lani Bot

Thank you for your interest in contributing to Lani Bot! This guide will help you get started.

## 🎯 Project Goals

- Help Detachment 175 cadets study Warrior Knowledge and General Cadet Knowledge
- Maintain a stateless, cost-effective architecture
- Provide a seamless, responsive user experience
- Follow Detachment 175 branding guidelines

## 🛠️ Development Setup

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

## 📝 Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints where possible
- Write docstrings for functions
- Keep functions focused and small
- Use meaningful variable names

### TypeScript (Frontend)
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and reusable
- Use CSS variables for theming

### General
- Write clear commit messages
- Comment complex logic
- Add tests for new features
- Update documentation

## 🔄 Git Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests**
5. **Commit with clear message:**
   ```bash
   git commit -m "Add feature: description of what you did"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**

## ✅ Before Submitting PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested locally
- [ ] Commit messages are clear
- [ ] No secrets in code

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Load Tests
```bash
cd tests
k6 run load-test.js
```

## 📚 Documentation

When adding features:
- Update README.md if needed
- Add comments to complex code
- Update API documentation
- Add examples if applicable

## 🐛 Bug Reports

When reporting bugs, include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/environment info
- Error messages/logs

## 💡 Feature Requests

When requesting features:
- Clear description
- Use case/problem it solves
- Proposed solution
- Any alternatives considered
- Impact on existing features

## 🔒 Security

If you discover a security issue:
1. **DO NOT** open a public issue
2. Email the maintainers directly
3. Provide details of the vulnerability
4. Wait for acknowledgment before disclosure

## 📋 Areas for Contribution

### High Priority
- Improve error handling
- Add more comprehensive tests
- Optimize performance
- Enhance accessibility

### Features
- Add more quiz question types
- Improve AI prompt engineering
- Add analytics/statistics
- Create admin dashboard

### Documentation
- Improve installation guides
- Add video tutorials
- Create FAQ section
- Translate documentation

### Design
- Improve mobile UX
- Add animations
- Enhance accessibility
- Create style guide

## 🎨 Detachment 175 Branding

When making UI changes:
- Use official Detachment 175 colors (see theme.css)
- Follow brand guidelines
- Maintain professional appearance
- Test on various devices

## 📊 Code Review Process

1. Maintainer reviews PR
2. Feedback provided if needed
3. Author makes changes
4. Tests must pass
5. PR merged when approved

## 🤝 Community Guidelines

- Be respectful and professional
- Help others when possible
- Ask questions if unclear
- Share knowledge and insights
- Follow code of conduct

## 📞 Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Check existing issues first
- Provide clear information

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Lani Bot better for Detachment 175 cadets! 🪽
