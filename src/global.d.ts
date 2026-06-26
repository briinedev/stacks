declare module '*.css';
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
