import { VectorStoreIndex, Settings, PromptTemplate } from 'llamaindex';
import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import { ChromaVectorStore } from '@llamaindex/chroma';

import fs from 'node:fs';

import {
    OLLAMA_MODEL,
    TXT_QUESTION,
    COLLECTION_NAME,
    TXT_SOURCE,
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
});

await runTask('自定义 prompt', async () => {
    const promptRecords = engine.getPrompts();

    console.log(promptRecords);
    console.log();

    console.log(promptRecords['responseSynthesizer:textQATemplate'].template);
    console.log();

    const customPrompt = new PromptTemplate({
        template: `以下是上下文信息。
---------------------
{context}
---------------------

仅根据上下文信息回答问题。
问题： {query}
回答：
        `,
        promptType: 'custom',
        templateVars: ['context', 'query'],
    });

    const formatted = customPrompt.format({
        context: fs.readFileSync(TXT_SOURCE, { encoding: 'utf8' }),
        query: TXT_QUESTION
    });

    console.log(customPrompt, formatted);

    engine.updatePrompts({
        'responseSynthesizer:textQATemplate': customPrompt,
    });
});

await runTask('问题向量化并生成结果', async () => {
    const res = await engine.query({ query: TXT_QUESTION, stream: true });

    for await (const an of res) {
        process.stdout.write(an.toString());
    }
    console.log();
}, {
    spinner: false,
});