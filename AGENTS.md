## General

- there is a `docs/` folder, containing documentation for the project, including:
    - `miningcore/` & `nexus/` projects overview
    - `knowledge/` folder is the primary AI-maintained knowledge base by topic
      - update relevant `docs/knowledge/*.md` file(s) after meaningful changes
      - keep a short changelog in those files
      - if commits are mentioned, collapse related commits into one changelog entry
      - each changelog entry should stay concise (1-3 lines)
    - `tasks/` folder contains task definitions for AI agents. When agent receives a task from this folder
      it MUST read the task (for example `my-task.md`), and MUST provide implementation report after finishing it
    - (`my-task.report.md`)
    - after completing a task documentation MUST be updated to reflect the changes.
    - when a task is received from chat without a task file in `tasks/` folder
      - DO NOT create a new `cli_<...>.report.md` by default
      - update the relevant knowledge base file(s) in `docs/knowledge/` instead
      - create a standalone report only when user explicitly asks for it
    - it is recommended to `tree` the `docs/` directory, it does not contain too many files.
    - avoid spawning to many reports
        - skip reporting if the task was too small to write a report
        - prefer updating `docs/knowledge/` topic files over creating new report files
- run `dotnet build` only for projects that were changed in the task, and fix build errors for those changed projects
- if agent have questions regarding the task it should ask user
- Git workflow is mandatory for every completed task:
  - create a commit every time a task/change is finished
  - sync with server immediately after commit (`git pull --rebase` then `git push`)


## Reporting guidelines

- do not change overviews after small changes that do not affect the understanding of the project structure or coding
  guidelines.
- keep documentation updates concise and focused on the task at hand.
- use clear and descriptive language in documentation updates.
- prefer adding/updating topic sections in `docs/knowledge/*.md` rather than writing new reports.
- if a report is explicitly requested, keep it concise and link back to the updated knowledge base topic(s).

## AI Behavoiur
- when running inline Python/scripts in PowerShell avoid Bash-style heredocs such as `python - <<'PY'`; use a here-string piped into Python (`@'
print("hi")
'@ | python -`) or save to a temporary `.py` file instead so the command parser stays happy.
- if u lack permissions to run dotnet DO NOT attempt to create local env, just prompt user for permissions  
- no binary files should be commited to git except prebuild C libs

## Search scan exclusions
- when using `rg`/`grep`/`find`, exclude generated and dependency folders by default.
- exclude folder names (any depth):
  - `.git`
  - `.idea`
  - `.vs`
  - `.vscode`
  - `node_modules`
  - `bin`
  - `obj`
  - `artifacts`
  - `dist`
  - `coverage`
  - `.cache`
  - `.pnpm-store`
- quick patterns:
  - `rg --glob '!**/{.git,.idea,.vs,.vscode,node_modules,bin,obj,artifacts,dist,coverage,.cache,.pnpm-store}/**' "PATTERN"`
  - `find . -type d \( -name .git -o -name .idea -o -name .vs -o -name .vscode -o -name node_modules -o -name bin -o -name obj -o -name artifacts -o -name dist -o -name coverage -o -name .cache -o -name .pnpm-store \) -prune -o -type f -print`
  - `grep -R --exclude-dir={.git,.idea,.vs,.vscode,node_modules,bin,obj,artifacts,dist,coverage,.cache,.pnpm-store} "PATTERN" .`
