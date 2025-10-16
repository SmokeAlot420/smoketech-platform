# Backend Agent Patterns

## Pydantic AI Agent Setup

### Agent Dependencies Pattern
```python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext
from supabase import Client
from openai import AsyncOpenAI
from httpx import AsyncClient

@dataclass
class AgentDeps:
    supabase: Client
    embedding_client: AsyncOpenAI
    http_client: AsyncClient
```

### Environment-Aware Configuration
```python
is_production = os.getenv("ENVIRONMENT") == "production"

if not is_production:
    # Development: prioritize .env file
    project_root = Path(__file__).resolve().parent
    dotenv_path = project_root / '.env'
    load_dotenv(dotenv_path, override=True)
else:
    # Production: use cloud platform env vars only
    load_dotenv()
```

### Model Configuration
```python
def get_model():
    llm = os.getenv('LLM_CHOICE') or 'gpt-4o-mini'
    base_url = os.getenv('LLM_BASE_URL') or 'https://api.openai.com/v1'
    api_key = os.getenv('LLM_API_KEY') or 'ollama'

    return OpenAIModel(llm, provider=OpenAIProvider(base_url=base_url, api_key=api_key))
```

## FastAPI Lifespan Management

### Resource Initialization Pattern
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedding_client, supabase, http_client, title_agent, mem0_client, tracer

    # Startup: Initialize all clients
    embedding_client, supabase = get_agent_clients()
    http_client = AsyncClient()
    title_agent = Agent(model=get_model())
    mem0_client = await get_mem0_client_async()

    yield  # App runs here

    # Shutdown: Clean up resources
    if http_client:
        await http_client.aclose()

app = FastAPI(lifespan=lifespan)
```

## SSE Streaming Pattern

### Stream Generator
```python
async def stream_generator(conversation_id: str, messages: List[Message], user: dict):
    try:
        async with agent.run_stream(
            prompt,
            deps=AgentDeps(
                supabase=supabase,
                embedding_client=embedding_client,
                http_client=http_client
            ),
            result_type=str,
            model=get_model()
        ) as result:
            # Stream chunks
            async for event in result.stream():
                # Handle different event types
                if isinstance(event, PartStartEvent):
                    pass
                elif isinstance(event, PartDeltaEvent):
                    if isinstance(event.delta, TextPartDelta):
                        yield f"data: {json.dumps({'text': event.delta.content})}\n\n"

            # Get final result
            agent_message = await result.get_data()
            yield f"data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
```

## Tool Implementation Pattern

### Standard Tool Structure
```python
async def tool_name(param1: str, param2: Any, dependency: Client) -> str:
    """
    Tool description for the agent.

    Args:
        param1: Description
        param2: Description
        dependency: Injected dependency (e.g., http_client, supabase)

    Returns:
        String result for the agent
    """
    try:
        # Implementation
        result = await dependency.operation(param1, param2)
        return format_result(result)
    except Exception as e:
        return f"Error: {str(e)}"
```

### Web Search Tool Example
```python
async def web_search_tool(query: str, http_client: AsyncClient, brave_api_key: str, searxng_base_url: str) -> str:
    try:
        if brave_api_key:
            return await brave_web_search(query, http_client, brave_api_key)
        elif searxng_base_url:
            return await searxng_web_search(query, http_client, searxng_base_url)
        else:
            return "No search provider configured"
    except Exception as e:
        return f"Search failed: {str(e)}"
```

## Database Patterns

### Vector Search
```python
async def retrieve_relevant_documents_tool(query: str, embedding_client: AsyncOpenAI, supabase: Client) -> str:
    # Get embedding
    embedding_response = await embedding_client.embeddings.create(
        input=query,
        model=embedding_model
    )
    embedding = embedding_response.data[0].embedding

    # Search with RPC function
    response = supabase.rpc(
        "retrieve_relevant_documents",
        {
            "query_embedding": embedding,
            "match_count": 10
        }
    ).execute()

    return format_documents(response.data)
```

## Safe Code Execution

### RestrictedPython Pattern
```python
from RestrictedPython import compile_restricted
from RestrictedPython.Guards import safe_globals, safe_builtins

async def execute_safe_code_tool(code: str) -> str:
    # Compile with restrictions
    byte_code = compile_restricted(code, '<string>', 'exec')

    # Set up safe environment
    restricted_globals = {
        '__builtins__': safe_builtins,
        '_print_': RestrictedPython.PrintCollector,
        '_getattr_': getattr,
    }

    # Execute
    exec(byte_code, restricted_globals)

    return str(restricted_globals.get('_print'))
```

## Error Handling

### Consistent Error Pattern
```python
try:
    # Main operation
    result = await operation()
    return format_success(result)
except SpecificError as e:
    logger.warning(f"Expected error: {e}")
    return f"Operation failed: {str(e)}"
except Exception as e:
    logger.error(f"Unexpected error: {e}", exc_info=True)
    return "An unexpected error occurred"
```

## Authentication

### Supabase JWT Verification
```python
from fastapi.security import HTTPBearer
security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
```