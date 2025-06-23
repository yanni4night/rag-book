import { config } from '@dotenvx/dotenvx';
import { table } from 'table';
const {
    OLLAMA_MODEL,
    TXT_SOURCE,
    TXT_QUESTION,
    TXT_DIR,
    COLLECTION_NAME,
} = config().parsed as {
    OLLAMA_MODEL: string,
    TXT_SOURCE: string,
    TXT_QUESTION: string
    TXT_DIR: string,
    COLLECTION_NAME: string,
};

if ('undefined' === typeof OLLAMA_MODEL) process.exit(-1);
if ('undefined' === typeof TXT_SOURCE) process.exit(-1);
if ('undefined' === typeof TXT_DIR) process.exit(-1);
if ('undefined' === typeof TXT_QUESTION) process.exit(-1);
if ('undefined' === typeof COLLECTION_NAME) process.exit(-1);

console.log(table([
    ['OLLAMA_MODEL', OLLAMA_MODEL],
    ['TXT_DIR', TXT_DIR],
    ['TXT_SOURCE', TXT_SOURCE],
    ['TXT_QUESTION', TXT_QUESTION],
    ['COLLECTION_NAME', COLLECTION_NAME],
], {
    header: {
        alignment: 'center',
        content: '执行参数',
    },
}));

export {
    OLLAMA_MODEL,
    TXT_SOURCE,
    TXT_QUESTION,
    TXT_DIR,
    COLLECTION_NAME,
}