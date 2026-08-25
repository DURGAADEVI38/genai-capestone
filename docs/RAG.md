# RAG Implementation

On startup, `DocumentLoader` reads Markdown and text files from the repository-level `samples/` directory. Documents are split into overlapping chunks, embedded with OpenAI embeddings, and stored in the configured ChromaDB collection.

The loader maps `hr_policies`, `it_support`, `training_materials`, and `security_guidelines` to the `hr`, `it`, `training`, and `security` categories used by agent retrieval filters. Existing chunks for a document are removed before it is loaded again, so application restarts do not duplicate content.

Required environment variables:

```text
OPENAI_API_KEY=...
CHROMA_PATH=./chroma_data
CHROMA_COLLECTION_NAME=onboardai-documents
```

The chat response returns the source filenames used for the answer. Keep source documents free of secrets and review retrieval results when updating policy content.