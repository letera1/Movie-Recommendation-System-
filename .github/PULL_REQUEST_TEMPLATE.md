name: Pull Request
description: Open a pull request
title: ""
labels: []
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for contributing to CineMatch ML! Please fill out the sections below.
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What does this PR do?
      placeholder: Brief summary of changes
    validations:
      required: true
  - type: textarea
    id: motivation
    attributes:
      label: Motivation
      description: Why is this change needed? Link to related issues if applicable.
      placeholder: This PR addresses issue/feature #...
    validations:
      required: true
  - type: dropdown
    id: type
    attributes:
      label: Type of change
      options:
        - Bug fix (non-breaking change which fixes an issue)
        - New feature (non-breaking change which adds functionality)
        - Breaking change (fix or feature that would cause existing functionality to not work as expected)
        - Documentation update
        - Refactoring (no functional changes)
        - Performance improvement
        - Tests (adding missing or correcting existing tests)
    validations:
      required: true
  - type: textarea
    id: testing
    attributes:
      label: How Has This Been Tested?
      description: Describe the tests you ran to verify your changes.
      placeholder: |
        - [ ] Backend tests pass (`pytest tests/ -v`)
        - [ ] Frontend tests pass (`npm test`)
        - [ ] Linting passes (`make lint` or `npm run lint`)
        - [ ] Manual testing completed
    validations:
      required: true
  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots (if UI changes)
      description: Add screenshots or GIFs showing the before/after behavior.
  - type: textarea
    id: checklist
    attributes:
      label: Checklist
      description: Ensure your PR meets the following criteria
      value: |
        - [ ] My code follows the project's coding standards
        - [ ] I have performed a self-review of my code
        - [ ] I have commented my code, particularly in hard-to-understand areas
        - [ ] I have made corresponding changes to the documentation
        - [ ] My changes generate no new warnings
        - [ ] I have added tests that prove my fix is effective or that my feature works
        - [ ] New and existing unit tests pass locally with my changes
    validations:
      required: true
  - type: textarea
    id: additional
    attributes:
      label: Additional Notes
      description: Any other notes for reviewers (deployment considerations, breaking changes, migration steps, etc.)
