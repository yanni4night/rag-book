import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { VectorStoreIndex, Settings } from 'llamaindex';
import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";

const OLLAMA_MODEL = 'deepseek-r1:8b';
const OLLAMA_EMBED_MODEL = OLLAMA_MODEL;
const DATA_DIR = './data';

Settings.llm = new Ollama({ model: OLLAMA_MODEL });
Settings.embedModel = new OllamaEmbedding({model: OLLAMA_EMBED_MODEL});

const reader = new SimpleDirectoryReader();

const documents = await reader.loadData(DATA_DIR);

const index = await VectorStoreIndex.fromDocuments(documents);

const engine = index.asQueryEngine();

const res = await engine.query({ query: '微前端的核心原理是什么？', stream: true });

for await (const an of res) {
    process.stdout.write(an.toString());
}
