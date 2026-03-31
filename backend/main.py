from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
import os
import tempfile
import uvicorn
from core_parser.edi_parser import EDIParser
from auth import verify_api_key, generate_api_key
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize the API
app = FastAPI(
    title="EdiFix API",
    description="Headless microservice for parsing and validating X12 837, 835, and 834 EDI files.",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    """Simple health check endpoint."""
    return {"status": "online", "message": "EdiFix Engine is ready.", "version": "1.0.0"}


# ── CORS preflight ────────────────────────────────────────────────────────────
@app.options("/api/v1/parse")
def options_parse_edi_file():
    return {}

@app.options("/api/v1/keys")
def options_keys():
    return {}


# ── Parse endpoint (now secured with API key) ─────────────────────────────────
@app.post("/api/v1/parse")
async def parse_edi_file(
    file: UploadFile = File(...),
    api_caller: dict = Depends(verify_api_key),   # ← API key required
):
    """
    Parses an EDI file and returns the JSON tree.
    Requires: Authorization: Bearer <api_key> header.
    """
    temp_fd, temp_path = tempfile.mkstemp(suffix=".edi")
    try:
        with os.fdopen(temp_fd, 'wb') as f:
            content = await file.read()
            f.write(content)

        parser = EDIParser(temp_path)
        final_tree = parser.parse()

        if not final_tree.get("metadata"):
            return {
                "status": "error",
                "message": "Failed to parse file. Is it a valid X12 format?",
                "errors": parser.errors,
            }

        return {
            "status": "success",
            "filename": file.filename,
            "data": final_tree,
            "called_by": api_caller.get("name", "unknown"),
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ── API Key management endpoints (called by the frontend dashboard) ───────────

@app.post("/api/v1/keys")
async def create_api_key(payload: dict = Body(...)):
    """
    Generate a new API key for a given user_id.
    Called by the frontend after the user is signed in.
    Body: { "user_id": "...", "name": "My Key" }
    """
    user_id = payload.get("user_id")
    name = payload.get("name", "My API Key")

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    raw_key, key_hash, key_prefix = generate_api_key()

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/rest/v1/api_keys",
            headers=headers,
            json={
                "user_id": user_id,
                "name": name,
                "key_hash": key_hash,
                "key_prefix": key_prefix,
            },
        )

    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="Failed to store API key")

    created = resp.json()[0] if isinstance(resp.json(), list) else resp.json()

    return {
        "id": created["id"],
        "name": created["name"],
        "key": raw_key,          # ← shown to the user ONCE
        "key_prefix": key_prefix,
        "created_at": created["created_at"],
    }


@app.get("/api/v1/keys/{user_id}")
async def list_api_keys(user_id: str):
    """
    List all API keys (masked) for a user.
    """
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/api_keys",
            headers=headers,
            params={
                "user_id": f"eq.{user_id}",
                "select": "id,name,key_prefix,created_at,last_used_at",
                "order": "created_at.desc",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch keys")

    return resp.json()


@app.delete("/api/v1/keys/{key_id}")
async def revoke_api_key(key_id: str):
    """
    Revoke (delete) an API key by its UUID.
    """
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{SUPABASE_URL}/rest/v1/api_keys",
            headers=headers,
            params={"id": f"eq.{key_id}"},
        )

    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail="Failed to revoke key")

    return {"status": "revoked", "id": key_id}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)