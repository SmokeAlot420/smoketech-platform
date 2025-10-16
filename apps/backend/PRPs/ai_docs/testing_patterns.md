# Testing Patterns

## Python Testing with pytest

### Environment Variable Mocking
```python
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

# Mock environment before imports
with patch.dict(os.environ, {
    'LLM_PROVIDER': 'openai',
    'LLM_BASE_URL': 'https://api.openai.com/v1',
    'LLM_API_KEY': 'test-api-key',
    'SUPABASE_URL': 'https://test-supabase-url.com',
    'SUPABASE_SERVICE_KEY': 'test-supabase-key'
}):
    # Mock external clients
    with patch('openai.AsyncOpenAI') as mock_openai_client:
        with patch('supabase.create_client') as mock_create_client:
            # Now safe to import modules
            from tools import web_search_tool
```

### Async Test Pattern
```python
@pytest.mark.asyncio
async def test_async_function():
    # Setup
    mock_client = AsyncMock()
    mock_response = MagicMock()
    mock_response.json.return_value = {"result": "success"}
    mock_client.get.return_value = mock_response

    # Execute
    result = await async_function(mock_client)

    # Assert
    assert result == "expected_value"
    mock_client.get.assert_called_once_with(
        'expected_url',
        params={'key': 'value'}
    )
```

### Fixture Pattern
```python
@pytest.fixture
def mock_supabase():
    """Create a mock Supabase client."""
    mock = MagicMock()
    mock.table.return_value.select.return_value.execute.return_value.data = []
    mock.rpc.return_value.execute.return_value.data = []
    return mock

@pytest.fixture
def mock_openai():
    """Create a mock OpenAI client."""
    mock = AsyncMock()
    mock.embeddings.create.return_value = MagicMock(
        data=[MagicMock(embedding=[0.1] * 1536)]
    )
    return mock

def test_with_fixtures(mock_supabase, mock_openai):
    # Use fixtures in test
    result = function_under_test(mock_supabase, mock_openai)
    assert result is not None
```

### Testing Tools Pattern
```python
class TestWebSearchTools:
    @pytest.mark.asyncio
    async def test_brave_search_success(self):
        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "web": {
                "results": [
                    {"title": "Test", "description": "Desc", "url": "url"}
                ]
            }
        }
        mock_client.get.return_value = mock_response

        result = await brave_web_search("query", mock_client, "api-key")

        assert "Test" in result
        assert "Desc" in result

    @pytest.mark.asyncio
    async def test_search_fallback(self):
        mock_client = AsyncMock()
        mock_client.get.side_effect = Exception("Network error")

        result = await web_search_tool("query", mock_client, "", "")

        assert "No search provider configured" in result
```

### Testing Database Operations
```python
def test_store_document():
    mock_db = MagicMock()
    mock_table = MagicMock()
    mock_db.table.return_value = mock_table
    mock_table.insert.return_value.execute.return_value = MagicMock()

    db_handler = DBHandler()
    db_handler.client = mock_db

    db_handler.store_document_chunks("doc_id", [
        {"text": "chunk", "embedding": [0.1, 0.2], "index": 0}
    ])

    mock_table.insert.assert_called_once()
    args = mock_table.insert.call_args[0][0]
    assert args['content'] == "chunk"
    assert args['metadata']['document_id'] == "doc_id"
```

## Frontend Testing with Playwright

### Authentication Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('.user-avatar')).toBeVisible();
  });
});
```

### Chat Interface Test
```typescript
test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page);
  });

  test('should send and receive messages', async ({ page }) => {
    await page.goto('/');

    // Send message
    await page.fill('textarea[name="message"]', 'Hello AI');
    await page.press('textarea[name="message"]', 'Enter');

    // Wait for response
    await expect(page.locator('.message.assistant').last()).toBeVisible({
      timeout: 10000
    });

    const response = await page.locator('.message.assistant').last().textContent();
    expect(response).toBeTruthy();
  });

  test('should stream responses', async ({ page }) => {
    await page.goto('/');

    // Send message
    await page.fill('textarea[name="message"]', 'Tell me a story');
    await page.press('textarea[name="message"]', 'Enter');

    // Check for streaming indicator
    await expect(page.locator('.streaming-indicator')).toBeVisible();

    // Wait for streaming to complete
    await expect(page.locator('.streaming-indicator')).toBeHidden({
      timeout: 30000
    });
  });
});
```

### Component Testing
```typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { MessageList } from './MessageList';

test('should render messages', async ({ mount }) => {
  const messages = [
    { id: '1', content: 'Hello', role: 'user', timestamp: '2024-01-01' },
    { id: '2', content: 'Hi there', role: 'assistant', timestamp: '2024-01-01' }
  ];

  const component = await mount(
    <MessageList messages={messages} />
  );

  await expect(component.locator('.message')).toHaveCount(2);
  await expect(component.locator('.message.user')).toContainText('Hello');
  await expect(component.locator('.message.assistant')).toContainText('Hi there');
});
```

## Mock Patterns

### API Response Mocking
```python
def mock_api_response(status_code=200, data=None, error=None):
    """Create a mock API response."""
    response = MagicMock()
    response.status_code = status_code
    response.raise_for_status = MagicMock()

    if error:
        response.raise_for_status.side_effect = Exception(error)
    else:
        response.json.return_value = data or {}

    return response
```

### SSE Stream Mocking
```python
async def mock_sse_stream(chunks: List[str]):
    """Mock SSE stream for testing."""
    for chunk in chunks:
        yield f"data: {json.dumps({'text': chunk})}\n\n"
    yield "data: [DONE]\n\n"

@pytest.mark.asyncio
async def test_stream_processing():
    chunks = ["Hello", " world", "!"]
    result = []

    async for event in mock_sse_stream(chunks):
        if "data: " in event:
            data = event.replace("data: ", "").strip()
            if data != "[DONE]":
                result.append(json.loads(data)['text'])

    assert "".join(result) == "Hello world!"
```

## Integration Testing

### Database Integration Test
```python
@pytest.mark.integration
async def test_database_integration():
    """Test actual database operations."""
    # Use test database
    test_db = create_client(
        os.getenv("TEST_SUPABASE_URL"),
        os.getenv("TEST_SUPABASE_KEY")
    )

    # Insert test data
    test_data = {"content": "test", "embedding": [0.1] * 1536}
    response = test_db.table('documents').insert(test_data).execute()

    assert response.data is not None
    doc_id = response.data[0]['id']

    # Verify retrieval
    result = test_db.table('documents').select('*').eq('id', doc_id).execute()
    assert len(result.data) == 1
    assert result.data[0]['content'] == 'test'

    # Cleanup
    test_db.table('documents').delete().eq('id', doc_id).execute()
```

### End-to-End Test
```python
@pytest.mark.e2e
async def test_full_pipeline():
    """Test complete document processing pipeline."""
    # Create test file
    test_file = Path("test_document.txt")
    test_file.write_text("Test content for processing")

    try:
        # Process file
        watcher = LocalFileWatcher(".")
        processor = TextProcessor()
        db_handler = DBHandler()

        changes = watcher.check_for_changes()
        assert len(changes) > 0

        for file in changes:
            if file['path'] == str(test_file):
                content = test_file.read_text()
                chunks = processor.chunk_text(content)
                embeddings = processor.create_embeddings(chunks)
                db_handler.store_document_chunks("test_id", chunks, embeddings)

        # Verify storage
        exists = db_handler.check_document_exists("test_id")
        assert exists

    finally:
        # Cleanup
        test_file.unlink()
```

## Test Configuration

### pytest.ini
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
markers =
    asyncio: mark test as async
    integration: mark test as integration test
    e2e: mark test as end-to-end test
    slow: mark test as slow running
```

### Playwright Config
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 8081,
    reuseExistingServer: !process.env.CI,
  },
});
```