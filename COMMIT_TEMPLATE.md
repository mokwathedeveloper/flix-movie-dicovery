# Git Commit Template for FLIX Movie Discovery Platform

## Author Information
- **GitHub Username:** mokwathedeveloper
- **Email:** moffatmokwa12@gmail.com
- **Repository:** https://github.com/mokwathedeveloper/flix-movie-discovery

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Example Commits

```bash
# Adding public deployment URL feature
git commit -m "feat(deployment): add public demo deployment configuration

- Add Netlify and Vercel configuration files
- Update README with live demo section and badges
- Create comprehensive deployment documentation
- Add GitHub repository setup guide

Closes #123"

# Updating documentation
git commit -m "docs(readme): update author information and repository links

- Update package.json with correct author details
- Fix GitHub username references throughout documentation
- Update LICENSE with proper copyright information

Author: mokwathedeveloper <moffatmokwa12@gmail.com>"

# Bug fix
git commit -m "fix(api): resolve TMDB API rate limiting issues

- Implement exponential backoff for API requests
- Add request queuing to prevent rate limit exceeded errors
- Update error handling for better user experience

Fixes #456"
```

## Git Configuration

Set up your Git configuration with your information:

```bash
# Set global Git configuration
git config --global user.name "mokwathedeveloper"
git config --global user.email "moffatmokwa12@gmail.com"

# Set repository-specific configuration (run in project directory)
git config user.name "mokwathedeveloper"
git config user.email "moffatmokwa12@gmail.com"
```

## Signing Commits (Optional but Recommended)

```bash
# Generate GPG key (if not already done)
gpg --full-generate-key

# List GPG keys
gpg --list-secret-keys --keyid-format LONG

# Configure Git to use GPG key
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true

# Sign commits
git commit -S -m "your commit message"
```

## Branch Naming Convention

```
feature/description-of-feature
bugfix/description-of-bug
hotfix/critical-fix
docs/documentation-update
chore/maintenance-task
```

### Examples
- `feature/public-deployment-setup`
- `bugfix/api-rate-limiting`
- `docs/update-readme-badges`
- `chore/update-dependencies`

## Pull Request Template

When creating pull requests, use this template:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings

## Related Issues
Closes #issue_number
```

## Release Tagging

```bash
# Create annotated tag for releases
git tag -a v1.0.0 -m "Release version 1.0.0 - Public demo deployment"

# Push tags to remote
git push origin --tags
```

## Useful Git Commands

```bash
# Check current configuration
git config --list

# View commit history with author information
git log --oneline --author="mokwathedeveloper"

# Amend last commit (if needed to fix author)
git commit --amend --author="mokwathedeveloper <moffatmokwa12@gmail.com>"

# Set upstream for new branch
git push -u origin feature/branch-name

# Interactive rebase to clean up commits
git rebase -i HEAD~3
```
