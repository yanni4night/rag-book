import { Ollama } from 'ollama';
import fs from 'node:fs';

import {
    OLLAMA_MODEL,
    TXT_SOURCE,
    TXT_QUESTION,
} from '../utils/setup.ts';

import { runTask } from '../utils/run-task.ts';

const TOP_K = 10;

const ollama = new Ollama();

function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] ** 2;
        magB += vecB[i] ** 2;
    }
    return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}


// 载入文档
const sentences = await runTask('载入并分割文档', () => {
    const EXTERNAL_TEXT = fs.readFileSync(TXT_SOURCE, { encoding: 'utf8' });
    return EXTERNAL_TEXT.split('\n').filter(n => n.trim());
});

const docWithEmbedding = await runTask('文档向量化', async () => {
    const docEmbedding = (await ollama.embed({
        model: OLLAMA_MODEL,
        input: sentences,
    })).embeddings;
    const dic = docEmbedding.map((emb, index) => ({
        embedding: emb,
        doc: sentences[index],
    }));
    return dic ;
});

const quesEmbedding = await runTask('问题向量化', async () => {
    const quesEmbedding = await ollama.embed({
        model: OLLAMA_MODEL,
        input: TXT_QUESTION,
    });
    return quesEmbedding;
});

const similarities = await runTask('相似度匹配', () => {
    const similarities = docWithEmbedding.map(({ embedding, doc }) => ({
        similarity: cosineSimilarity(embedding, quesEmbedding.embeddings[0]),
        doc,
    })).sort((p, n) => n.similarity - p.similarity).slice(0, TOP_K);
    return similarities;
});


await runTask('生成结果', async () => {
    // 构建 prompt
    const prompt = `
请基于以下的上下文回答问题，如果上下文中不包含足够的回答问题的信息，请回答‘我暂时无法回答该问题’，不要编造。

上下文：
===
${similarities.map(d => d.doc).join('\n\n')}
===

我的问题是：${TXT_QUESTION}
`;

    // 推理和文本生成
    const response = await ollama.generate({
        model: OLLAMA_MODEL,
        prompt,
        stream: true,
    });
    for await (const n of response) {
        process.stdout.write(n.response);
    }
    console.log();
}, { spinner: false });



// <think>
// 嗯，我需要回答的问题是关于太平天国运动最终失败的原因。首先，我得回顾一下提供的上下文，看看里面提到了哪些可能影响结果的因素。

// 根据上下文，太平天国运动持续了14年，波及了18个省，导致约2000万人死亡。但尽管规模庞大，最终却失败了。失败后，它严重动摇了清王朝的统治基础，并推动了中国近代化进程。不过，具体为何最终失败呢？

// 我记得上下文中提到过几个关键点：

// 1. **社会实验中的问题**：特别是“男女分馆”制度，这导致了大量家庭悲剧，比如绝望自杀。这种政策不仅在军事上可能存在问题，还在道德和伦理上引发了争议。

// 2. **领导层腐败**：东王杨秀清修建了庞大的王府，享受奢华生活，与起初的朴素作风形成对比。这可能导致了内部不稳定和权力斗争加剧，最终在“天京事变”中爆发。

// 3. **文化政策**：太平天国试图打破传统文化，捣毁孔庙，焚烧儒家经典，这可能削弱了社会的文化基础。曾国藩批评他们的文化政策，但也有研究显示他们保留了一些科举内容。

// 4. **经济管制**：控制区的商业活动受到严格管制，尽管部分地区保持了市场活跃，这可能限制了经济发展或导致资源分配不均。

// 5. **意识形态基础**：洪秀全创立的“拜上帝教”，虽然提出了平等理念，但其教义可能与实际操作相脱节，比如严格的军事共产主义，导致资源耗尽和内部矛盾。

// 6. **战争压力**：长期的战争消耗了大量人力物力，导致资源枯竭，加上外部入侵（如法国入侵）可能加剧了情况。

// 综合以上因素，太平天国最终失败的原因可能包括：

// - **内部腐败和权力斗争**：领导层的腐败和高层之间的矛盾削弱了运动的凝聚力。
// - **不合理的政策**：如“男女分馆”导致社会动荡，文化实验破坏传统基础，经济管制限制发展。
// - **资源耗尽**：长期战争消耗了大量资源，加上自然灾害和内部问题，使得无法持续支持起义。
// - **意识形态的合理性不足**：虽然提出了平等理念，但实际政策可能与这些理念脱节，导致民众不满或缺乏支持。

// 因此，可以认为太平天国运动失败是由于领导层腐败、政策失当以及资源耗尽等多方面因素的综合结果。
// </think>

// 太平天国运动最终失败的原因主要包括以下几点：

// 1. **领导层腐败与权力斗争**：东王杨秀清及其高层逐渐腐化，享乐主义严重，与起初的朴素理想背道而驰，加剧了内部矛盾。

// 2. **不合理的政策**：如“男女分馆”制度导致家庭悲剧，文化政策破坏传统基础，经济管制限制资源流动。

// 3. **资源耗尽与战争压力**：长期战争消耗资源，加上外部入侵和自然灾害，使得无法维持起义。

// 4. **意识形态的合理性不足**：虽然提出平等理念，但实际政策与之脱节，导致民众支持减少。

// 这些因素共同导致了太平天国运动的失败。