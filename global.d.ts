declare namespace NodeJS {
  interface ProcessEnv {
    OLLAMA_MODEL: string;
    TXT_SOURCE: string;
    TXT_QUESTION: string;
    NODE_ENV: 'development' | 'production';
  }
}