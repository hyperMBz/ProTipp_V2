# 🔒 Branch Protection Configuration

## Main Branch Protection Rules

### Beállítások a GitHub Settings → Branches → main branch-hez:

#### ✅ **Protect matching branches**
- [x] Restrict pushes that create files larger than 100 MB
- [x] Restrict pushes that create files larger than a specified limit

#### ✅ **Require a pull request before merging**
- [x] Require approvals: **1 approval minimum**
- [x] Dismiss stale reviews when new commits are pushed
- [x] Require review from code owners (ha van CODEOWNERS file)
- [x] Restrict who can dismiss pull request reviews

#### ✅ **Require status checks to pass before merging**
- [x] Require branches to be up to date before merging
- **Required status checks:**
  - `quality` (🔍 Code Quality & Tests)
  - `build` (🏗️ Build Verification)

#### ✅ **Require conversation resolution before merging**
- [x] All conversations must be resolved

#### ✅ **Require signed commits**
- [x] Require commits to be signed (opcionális, de ajánlott)

#### ✅ **Require linear history**
- [x] Require linear history (clean commit history)

#### ✅ **Include administrators**
- [x] Include administrators (még az admin sem kerülheti meg)

#### ✅ **Restrict force pushes**
- [x] Do not allow force pushes

#### ✅ **Allow deletions**
- [ ] Allow deletions (tiltva)

---

## 🎯 **Eredmény:**
- ❌ **Nem lehet közvetlenül push-olni** a main branch-re
- ✅ **Csak PR-en keresztül** lehet változtatni
- ✅ **CI/CD pipeline-nak** zöldnek kell lennie
- ✅ **Code review** kötelező
- ✅ **Tiszta git history** guaranteed
