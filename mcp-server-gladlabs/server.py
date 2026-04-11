"""
Glad Labs Operator MCP Server — private business tools.

This server is the operator layer on top of Poindexter. It is NOT shipped
in the public Poindexter release. It contains tools that only Glad Labs LLC
uses to run its content business: Discord posting, Lemon Squeezy lookups,
customer support routing, prompt-pack subscriber management, etc.

Architecture:
    Poindexter MCP (mcp-server/)         — public, ships with the product
    Glad Labs MCP  (mcp-server-gladlabs/) — private, this file

Both servers share the same local Postgres pool and httpx client. They are
registered as two distinct entries in the Claude Desktop / Claude Code MCP
config so the tool surfaces stay clean and non-overlapping.

Usage:
    uv --directory mcp-server-gladlabs run server.py
"""

import logging
import os

import asyncpg
import httpx

from mcp.server.fastmcp import FastMCP

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gladlabs-mcp")

LOCAL_DB_DSN = os.getenv(
    "LOCAL_DATABASE_URL",
    "postgresql://poindexter:poindexter-brain-local@localhost:5433/poindexter_brain",
)
POINDEXTER_API_URL = (
    os.getenv("POINDEXTER_API_URL")
    or os.getenv("GLADLABS_API_URL", "http://localhost:8002")
)
POINDEXTER_API_TOKEN = (
    os.getenv("POINDEXTER_API_TOKEN")
    or os.getenv("GLADLABS_API_TOKEN", "dev-token")
)

# Discord webhook URL — populated by setting the GLADLABS_DISCORD_WEBHOOK env
# var on the MCP entry in claude_desktop_config.json. When unset, discord_post
# returns a clear "not configured" message rather than failing silently.
DISCORD_WEBHOOK_URL = os.getenv("GLADLABS_DISCORD_WEBHOOK", "")

# Lazy-initialized shared resources
_pool: asyncpg.Pool | None = None
_http: httpx.AsyncClient | None = None


async def _get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(LOCAL_DB_DSN, min_size=1, max_size=3)
    return _pool


async def _get_http() -> httpx.AsyncClient:
    global _http
    if _http is None:
        _http = httpx.AsyncClient(timeout=30.0)
    return _http


mcp = FastMCP("GladLabs", instructions="""
Glad Labs operator MCP server — private business tools that layer on top of
Poindexter. Use these tools to run the Glad Labs content business: post to
Discord, look up customers, manage subscriber lists, etc.

This server is private to Matt / Glad Labs LLC and is NOT part of the public
Poindexter release.
""")


# ============================================================================
# DISCORD TOOLS
# ============================================================================

@mcp.tool()
async def discord_post(message: str, username: str = "Poindexter") -> str:
    """Post a message to the Glad Labs Discord via webhook.

    Requires GLADLABS_DISCORD_WEBHOOK env var to be set on this MCP entry.
    The webhook URL determines which channel the message lands in.

    Args:
        message: The message text to post (Discord supports markdown).
        username: Display name for the bot post (default "Poindexter").
    """
    if not DISCORD_WEBHOOK_URL:
        return (
            "Discord webhook not configured. Set GLADLABS_DISCORD_WEBHOOK in the "
            "gladlabs MCP env block in claude_desktop_config.json to enable."
        )

    if not message or not message.strip():
        return "Refusing to post empty message."

    try:
        client = await _get_http()
        resp = await client.post(
            DISCORD_WEBHOOK_URL,
            json={"content": message[:2000], "username": username},
        )
        if resp.status_code in (200, 204):
            return f"Posted to Discord ({len(message)} chars)."
        return f"Discord rejected the message: HTTP {resp.status_code} — {resp.text[:200]}"
    except Exception as e:
        return f"Discord post failed: {type(e).__name__}: {e}"


@mcp.tool()
async def discord_status() -> str:
    """Check whether the Discord webhook is configured and responsive.

    Returns the webhook URL host (without the secret token) and a configuration
    status. Does NOT post to the channel.
    """
    if not DISCORD_WEBHOOK_URL:
        return "Discord webhook NOT configured (GLADLABS_DISCORD_WEBHOOK env var unset)."

    # Strip the secret part of the URL — only show host + the public path prefix
    try:
        from urllib.parse import urlparse
        parsed = urlparse(DISCORD_WEBHOOK_URL)
        # webhooks/<id>/<token> — show host + 'webhooks/<id>/...redacted'
        path_parts = parsed.path.split("/")
        redacted_path = "/".join(path_parts[:-1]) + "/[REDACTED]" if len(path_parts) > 2 else parsed.path
        return f"Discord webhook configured: {parsed.scheme}://{parsed.netloc}{redacted_path}"
    except Exception:
        return "Discord webhook configured (URL parse failed, but env var is set)."


# ============================================================================
# OPERATOR HEALTH
# ============================================================================

@mcp.tool()
async def operator_status() -> str:
    """Quick operator-side status: which Glad Labs business tools are configured.

    Useful as a one-shot check that the operator MCP layer is wired correctly.
    """
    lines = ["Glad Labs operator MCP status:"]
    lines.append(f"  Local DB DSN: {'set' if LOCAL_DB_DSN else 'unset'}")
    lines.append(f"  Poindexter API URL: {POINDEXTER_API_URL}")
    lines.append(f"  Poindexter API token: {'set' if POINDEXTER_API_TOKEN else 'unset'}")
    lines.append(f"  Discord webhook: {'configured' if DISCORD_WEBHOOK_URL else 'NOT configured'}")
    lines.append("")
    lines.append("Tools available in this server:")
    lines.append("  - discord_post(message, username) — post to Glad Labs Discord")
    lines.append("  - discord_status() — webhook configuration check")
    lines.append("  - operator_status() — this tool")
    lines.append("")
    lines.append("Future tools (placeholders, not yet implemented):")
    lines.append("  - lemonsqueezy_recent_orders(days)")
    lines.append("  - lemonsqueezy_lookup_customer(email)")
    lines.append("  - prompt_pack_subscriber_count()")
    lines.append("  - guide_buyer_lookup(email)")
    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run(transport="stdio")
