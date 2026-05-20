# Issue Tracker

Issues for this project are tracked as **local markdown files** under `.scratch/<feature>/`.

## Directory layout

```
.scratch/
  <feature-slug>/
    issue.md       # The issue body (markdown with YAML frontmatter)
```

## Issue file format

Each `issue.md` uses YAML frontmatter for metadata:

```yaml
---
id: <short-unique-id>
title: "<issue title>"
status: open | in-progress | closed
labels: [needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix]
created: <ISO date>
reporter: <name or gh handle>
---
```

The body is freeform markdown describing the issue.

## How skills interact

- **to-issues**: Creates a new `.scratch/<feature>/issue.md` file with frontmatter.
- **triage**: Reads issue files, updates `labels` and `status` in frontmatter.
- **to-prd**: Reads issue files and expands into PRD documents.
- **qa**: Reads issue files for verification checklists.

## CLI tools

No external CLI is required. Skills operate directly on the filesystem.
