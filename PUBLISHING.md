# Publishing Checklist

Complete checklist before publishing to NPM.

## ✅ Pre-Publish Checklist

### 1. Update Package Metadata
- [ ] Update `package.json`:
  ```json
  {
    "name": "@YOUR-NPM-USERNAME/auto-docs",
    "author": "Your Name <your.email@example.com>",
    "repository": {
      "type": "git",
      "url": "https://github.com/YOUR-USERNAME/auto-docs"
    },
    "bugs": {
      "url": "https://github.com/YOUR-USERNAME/auto-docs/issues"
    },
    "homepage": "https://github.com/YOUR-USERNAME/auto-docs#readme"
  }
  ```

### 2. Update README.md
- [ ] Replace all `@your-name/auto-docs` with your actual package name
- [ ] Replace all `your-name` with your GitHub username
- [ ] Update installation instructions
- [ ] Add badges (npm version, license, downloads)
- [ ] Verify all links work

### 3. Verify Files
- [ ] Check `bin/` executables work: `npm link && auto-docs --version`
- [ ] Verify templates are included: `ls templates/`
- [ ] Check `.npmignore` excludes unnecessary files
- [ ] Confirm `LICENSE` file exists

### 4. Test Package Locally
```bash
# Create package
npm pack

# Test in new directory
mkdir /tmp/test-package && cd /tmp/test-package
npm init -y
npm install /path/to/your-name-auto-docs-1.0.0.tgz

# Test commands
npx auto-docs --version
npx auto-docs --help
```

### 5. Version & Changelog
- [ ] Update version in `package.json` (follow [semver](https://semver.org/))
- [ ] Update `CHANGELOG.md` with release notes
- [ ] Update URLs in CHANGELOG.md

### 6. Git & GitHub
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create release tag: `git tag v1.0.0 && git push origin v1.0.0`
- [ ] Create GitHub Release with CHANGELOG notes

### 7. NPM Account Setup
- [ ] Create NPM account at https://www.npmjs.com/signup
- [ ] Enable 2FA: https://www.npmjs.com/settings/YOUR-USERNAME/tfa
- [ ] Login locally: `npm login`
- [ ] Verify login: `npm whoami`

### 8. Package Name Availability
```bash
# Check if package name is available
npm search @YOUR-USERNAME/auto-docs

# Or try to view it (should 404 if available)
npm view @YOUR-USERNAME/auto-docs
```

### 9. Dry Run
```bash
# See what will be published
npm publish --dry-run

# Check package contents
npm pack && tar -xzf *.tgz && ls package/
```

### 10. Final Verification
- [ ] All tests pass: `npm test`
- [ ] No sensitive data in package
- [ ] No `.env` files included
- [ ] Dependencies versions are correct
- [ ] `engines.node` matches your requirements

## 🚀 Publishing

### First Time Publish
```bash
# Make sure you're logged in
npm whoami

# Publish (public package)
npm publish --access public

# Or publish scoped package
npm publish @YOUR-USERNAME/auto-docs --access public
```

### Update Existing Package
```bash
# Update version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0

# Publish update
npm publish
```

## 📊 Post-Publish

### 1. Verify Publication
- [ ] Check package page: https://www.npmjs.com/package/@YOUR-USERNAME/auto-docs
- [ ] Test installation: `npx @YOUR-USERNAME/auto-docs --version`
- [ ] Verify README displays correctly on NPM

### 2. GitHub Release
- [ ] Create GitHub Release for the version
- [ ] Add CHANGELOG notes to release description
- [ ] Attach tarball to release (optional)

### 3. Documentation
- [ ] Update installation instructions in README
- [ ] Create examples repository (optional)
- [ ] Write blog post announcing release (optional)

### 4. Monitoring
- [ ] Watch for issues on GitHub
- [ ] Monitor download statistics
- [ ] Respond to community feedback

## 🔄 Update Workflow (Patch/Minor/Major)

```bash
# 1. Make changes
# 2. Update CHANGELOG.md
# 3. Update version
npm version patch  # or minor, or major

# 4. Push with tags
git push && git push --tags

# 5. Publish
npm publish

# 6. Create GitHub Release
gh release create v1.0.1 --notes "Bug fixes and improvements"
```

## ⚠️ Important Notes

### Package Name
- Must be unique on NPM registry
- Scoped packages: `@username/package-name`
- Follow naming conventions: lowercase, hyphens allowed

### Versioning
- Follow [Semantic Versioning](https://semver.org/):
  - **MAJOR**: Breaking changes
  - **MINOR**: New features (backward compatible)
  - **PATCH**: Bug fixes

### NPM Access
- Public packages: Free, anyone can install
- Private packages: Require NPM Pro subscription
- Use `--access public` for scoped packages

### Security
- Never publish with `.env` files
- Enable 2FA on NPM account
- Use `npm audit` to check dependencies
- Review `.npmignore` carefully

## 📝 Quick Commands Reference

```bash
# Package info
npm pack --dry-run          # See what will be included
npm publish --dry-run       # See publish info without publishing

# Version management
npm version patch           # 1.0.0 -> 1.0.1
npm version minor           # 1.0.0 -> 1.1.0
npm version major           # 1.0.0 -> 2.0.0

# Publishing
npm publish                 # Publish update
npm publish --access public # Publish public scoped package
npm publish --tag beta      # Publish with dist-tag

# Deprecation
npm deprecate @scope/pkg@version "Message"
npm unpublish @scope/pkg@version --force  # Use carefully!

# Package management
npm owner add username package-name
npm owner rm username package-name
npm owner ls package-name
```

## 🆘 Troubleshooting

### "You do not have permission to publish"
- Verify you're logged in: `npm whoami`
- Check package name doesn't exist
- Add `--access public` for scoped packages

### "Package name too similar to existing packages"
- Choose a more distinctive name
- Use scoped package: `@username/package-name`

### "Version already exists"
- Update version: `npm version patch`
- Check `package.json` version number

### Changes not showing on NPM
- Wait 5-10 minutes for CDN propagation
- Hard refresh browser (Ctrl+Shift+R)
- Check correct package: `npm view @scope/package-name`
