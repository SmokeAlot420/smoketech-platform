# RAG Pipeline Patterns

## Pipeline Architecture

### Dual-Mode Operation
```python
# Single-run mode (for scheduled jobs)
python Local_Files/main.py --directory "./data" --single-run

# Continuous mode (for real-time monitoring)
python Local_Files/main.py --directory "./data"
```

### Docker Entrypoint Pattern
```python
def main():
    mode = os.getenv('PIPELINE_MODE', 'single_run').lower()
    source = os.getenv('PIPELINE_SOURCE', 'local_files').lower()

    if mode == 'single_run':
        run_single_pipeline(source)
    elif mode == 'continuous':
        run_continuous_pipeline(source)
```

## File Watcher Pattern

### Local File Watcher Structure
```python
class LocalFileWatcher:
    def __init__(self, directory: str, config_file: str = "file_watcher_config.json"):
        self.directory = Path(directory)
        self.config_file = Path(config_file)
        self.last_check_time = self.load_last_check_time()

    def check_for_changes(self) -> List[Dict[str, Any]]:
        """Check for new or modified files since last check."""
        changed_files = []
        current_time = datetime.now(timezone.utc)

        for file_path in self.directory.rglob('*'):
            if self.should_process_file(file_path):
                changed_files.append({
                    'path': str(file_path),
                    'modified': file_path.stat().st_mtime,
                    'size': file_path.stat().st_size
                })

        self.save_last_check_time(current_time)
        return changed_files
```

### Google Drive Watcher Pattern
```python
class GoogleDriveWatcher:
    def __init__(self, credentials_path: str = "credentials.json"):
        self.service = self.authenticate(credentials_path)
        self.last_check_time = self.load_last_check_time()

    def check_for_changes(self, folder_id: Optional[str] = None) -> List[Dict]:
        """Check for changes in Google Drive."""
        query = f"modifiedTime > '{self.last_check_time.isoformat()}'"
        if folder_id:
            query += f" and '{folder_id}' in parents"

        results = self.service.files().list(
            q=query,
            fields="files(id, name, mimeType, modifiedTime)"
        ).execute()

        return results.get('files', [])
```

## Text Processing Pattern

### Document Chunking
```python
def chunk_text(text: str, chunk_size: int = 400, overlap: int = 0) -> List[str]:
    """Split text into overlapping chunks."""
    if not text:
        return []

    text = text.replace('\r', '')
    chunks = []

    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        if chunk:
            chunks.append(chunk)

    return chunks
```

### PDF Processing
```python
def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF content."""
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name

    try:
        with open(temp_file_path, 'rb') as file:
            pdf_reader = pypdf.PdfReader(file)
            text = ""

            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"

        return text
    finally:
        os.remove(temp_file_path)
```

### CSV Processing
```python
def extract_text_from_csv(file_content: bytes) -> str:
    """Convert CSV to readable text."""
    text_stream = io.StringIO(file_content.decode('utf-8'))
    csv_reader = csv.DictReader(text_stream)

    formatted_rows = []
    for row in csv_reader:
        row_text = ", ".join([f"{key}: {value}" for key, value in row.items()])
        formatted_rows.append(row_text)

    return "\n".join(formatted_rows)
```

## Embedding Generation

### OpenAI Embedding Pattern
```python
def create_embeddings(text_chunks: List[str]) -> List[List[float]]:
    """Create embeddings for text chunks."""
    openai_client = OpenAI(
        api_key=os.getenv("EMBEDDING_API_KEY"),
        base_url=os.getenv("EMBEDDING_BASE_URL")
    )

    embeddings = []
    for chunk in text_chunks:
        response = openai_client.embeddings.create(
            input=chunk,
            model=os.getenv('EMBEDDING_MODEL_CHOICE', 'text-embedding-3-small')
        )
        embeddings.append(response.data[0].embedding)

    return embeddings
```

## Database Handler Pattern

### Supabase Storage
```python
class DBHandler:
    def __init__(self):
        self.client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_KEY")
        )

    def store_document_chunks(self, document_id: str, chunks: List[Dict]) -> None:
        """Store document chunks with embeddings."""
        for chunk in chunks:
            self.client.table('documents').insert({
                'content': chunk['text'],
                'embedding': chunk['embedding'],
                'metadata': {
                    'document_id': document_id,
                    'chunk_index': chunk['index'],
                    'source': chunk['source']
                }
            }).execute()

    def check_document_exists(self, file_hash: str) -> bool:
        """Check if document already processed."""
        response = self.client.table('document_metadata').select('id').eq(
            'file_hash', file_hash
        ).execute()

        return len(response.data) > 0
```

## State Management Pattern

### JSON State Tracking
```python
class StateManager:
    def __init__(self, state_file: str = "pipeline_state.json"):
        self.state_file = Path(state_file)
        self.state = self.load_state()

    def load_state(self) -> Dict:
        """Load pipeline state from file."""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {'last_run': None, 'processed_files': []}

    def save_state(self) -> None:
        """Save current state."""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, default=str, indent=2)

    def mark_processed(self, file_id: str) -> None:
        """Mark file as processed."""
        self.state['processed_files'].append({
            'id': file_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        self.save_state()
```

## Error Handling

### Resilient Processing Pattern
```python
async def process_files(files: List[Dict]) -> None:
    """Process files with error recovery."""
    failed_files = []

    for file in files:
        try:
            content = await fetch_file_content(file)
            chunks = chunk_text(content)
            embeddings = create_embeddings(chunks)
            store_document_chunks(file['id'], chunks, embeddings)
        except Exception as e:
            logger.error(f"Failed to process {file['name']}: {e}")
            failed_files.append({
                'file': file,
                'error': str(e),
                'timestamp': datetime.now(timezone.utc)
            })

    if failed_files:
        # Retry or log for manual intervention
        save_failed_files_for_retry(failed_files)
```

## Continuous Mode Pattern

### Main Loop with Sleep
```python
def run_continuous_mode(watcher: FileWatcher, processor: TextProcessor):
    """Run continuous monitoring."""
    check_interval = int(os.getenv('CHECK_INTERVAL', 300))  # 5 minutes default

    while True:
        try:
            changed_files = watcher.check_for_changes()
            if changed_files:
                logger.info(f"Processing {len(changed_files)} changed files")
                processor.process_files(changed_files)
            else:
                logger.info("No changes detected")

            time.sleep(check_interval)
        except KeyboardInterrupt:
            logger.info("Stopping continuous mode")
            break
        except Exception as e:
            logger.error(f"Error in continuous mode: {e}")
            time.sleep(60)  # Wait before retry
```