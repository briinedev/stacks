/// <reference types="vite/client" />

declare module '*.css';
declare module '*.mdx' {
  import { ComponentType } from 'preact';

  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare interface ImportMetaEnv {
  readonly VITE_API_HOST: string;
  readonly [key: string]: string | undefined;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
