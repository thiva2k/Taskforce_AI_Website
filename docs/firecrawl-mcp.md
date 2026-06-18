# Firecrawl MCP integration

Add a Firecrawl [MCP](https://modelcontextprotocol.io/) server to Claude Code so it can
scrape websites and return the data directly in chat.

## One-time setup

1. Create a Firecrawl API key at <https://www.firecrawl.dev/app/api-keys> (starts with `fc-`).

2. Add the MCP server config. Create a `.mcp.json` at the repo root (shared with the
   project) **or** add the same block to your personal `~/.claude` config. The
   `${FIRECRAWL_API_KEY}` placeholder is expanded by Claude Code at launch, so **no key
   is stored in the file**:

   ```json
   {
     "mcpServers": {
       "firecrawl": {
         "command": "npx",
         "args": ["-y", "firecrawl-mcp"],
         "env": { "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}" }
       }
     }
   }
   ```

3. Make the key available to Claude Code:

   **Local Claude Code** — export it in the shell that launches `claude`:
   ```bash
   export FIRECRAWL_API_KEY="fc-your-key-here"
   ```
   (Add it to your shell profile or a local, gitignored `.env` to persist it.)

   **Claude Code on the web** — add `FIRECRAWL_API_KEY` as an environment variable in
   the remote environment's configuration:
   <https://code.claude.com/docs/en/claude-code-on-the-web>

4. Start (or restart) Claude Code. On first use you'll be asked to approve the
   `firecrawl` MCP server. Run `/mcp` to confirm it's connected.

## What it provides

Once connected, Claude gains Firecrawl tools, including:

- **scrape** — fetch a single page as markdown / HTML / structured data
- **crawl** — follow links across a site
- **map** — list all URLs on a site
- **search** — web search with scraped results
- **extract** — pull structured (LLM-shaped) data from pages

## Usage

Just ask in chat, e.g. _"scrape https://example.com and summarize the pricing page."_
Claude calls the Firecrawl tool and reports the results inline.

> Note: an MCP server cannot be added to an already-running session. If you add the
> key mid-session, start a new Claude Code session for the `firecrawl` tools to appear.
