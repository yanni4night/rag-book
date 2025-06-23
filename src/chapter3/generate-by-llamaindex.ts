// 初始化环境
import { ChromaClient } from 'chromadb';
import { VectorStoreIndex, Settings, SentenceSplitter, storageContextFromDefaults } from 'llamaindex';
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import { ChromaVectorStore } from '@llamaindex/chroma';

import {
  OLLAMA_MODEL,
  TXT_DIR,
  COLLECTION_NAME,
} from '../utils/setup.ts';

import { runTask } from '../utils/run-task.ts';

// 配置参数
const OLLAMA_EMBED_MODEL = OLLAMA_MODEL;

Settings.llm = new Ollama({ model: OLLAMA_MODEL });
Settings.embedModel = new OllamaEmbedding({ model: OLLAMA_EMBED_MODEL });



const nodes = await runTask('载入并分割文档', async () => {
  const reader = new SimpleDirectoryReader();

  const documents = await reader.loadData(TXT_DIR);

  const nodeParser = new SentenceSplitter();
  const nodes = nodeParser.getNodesFromDocuments(documents);
  return nodes;
});

await runTask('向量化文档并写库', async () => {
  const chroma = new ChromaClient();

  await chroma.deleteCollection({ name: COLLECTION_NAME });

  await chroma.getOrCreateCollection({
    name: COLLECTION_NAME,
  });

  const vectorStore = new ChromaVectorStore({
    collectionName: COLLECTION_NAME,
  });

  const ctx = await storageContextFromDefaults({ vectorStore });

  await VectorStoreIndex.fromDocuments(nodes, {
    storageContext: ctx,
  });
});