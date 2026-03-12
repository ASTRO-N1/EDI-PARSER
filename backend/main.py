from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import uvicorn
from core_parser.edi_parser import EDIParser

# Initialize the API
app = FastAPI(
    title="Inspiron EDI Parser API",
    description="Backend engine for parsing and validating X12 837, 835, and 834 files."
)

# Enable CORS so your React frontend running on a different port can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon development, allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    """Simple health check endpoint."""
    return {"status": "online", "message": "EDI Engine is ready."}

@app.post("/api/v1/parse")
async def parse_edi_file(file: UploadFile = File(...)):
    """Receives an EDI file, parses it, validates it, and returns the JSON tree."""
    
    # 1. Save the uploaded file temporarily using a secure TempFile
    temp_fd, temp_path = tempfile.mkstemp(suffix=".edi")
    try:
        with os.fdopen(temp_fd, 'wb') as f:
            content = await file.read()
            f.write(content)
            
        # 2. Run the parser engine
        parser = EDIParser(temp_path)
        final_tree = parser.parse()
        
        # 3. Check if the parser completely failed (e.g. not an EDI file)
        if not final_tree.get("metadata"):
            return {
                "status": "error",
                "message": "Failed to parse file. Is it a valid X12 format?",
                "errors": parser.errors
            }
            
        # 4. Return the React-ready payload
        return {
            "status": "success",
            "filename": file.filename,
            "data": final_tree
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        # Always clean up the temp file so the server disk doesn't fill up
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)