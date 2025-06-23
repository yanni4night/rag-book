import { VectorStoreIndex, Settings } from 'llamaindex';
import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import { ChromaVectorStore } from '@llamaindex/chroma';

import {
  OLLAMA_MODEL,
  TXT_QUESTION,
  COLLECTION_NAME,
} from '../utils/setup.ts';

import { runTask } from '../utils/run-task.ts';

const OLLAMA_EMBED_MODEL = OLLAMA_MODEL;

Settings.llm = new Ollama({ model: OLLAMA_MODEL });
Settings.embedModel = new OllamaEmbedding({ model: OLLAMA_EMBED_MODEL });

const vectorStore = new ChromaVectorStore({
  collectionName: COLLECTION_NAME,
});

const engine = await runTask('构造数据库查询索引', async () => {
  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  return index.asQueryEngine();
})

await runTask('问题向量化并生成结果', async () => {
  const res = await engine.query({ query: TXT_QUESTION, stream: true });

  for await (const an of res) {
    process.stdout.write(an.toString());
  }
  console.log();
}, {
  spinner: false,
});
