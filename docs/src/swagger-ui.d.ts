// swagger-ui-dist ships no types for its ES bundle; this covers what the explorer uses.
declare module 'swagger-ui-dist/swagger-ui-es-bundle.js' {
  interface SwaggerUIOptions {
    url: string | undefined;
    domNode: HTMLElement;
    deepLinking?: boolean;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    supportedSubmitMethods?: string[];
    tryItOutEnabled?: boolean;
    requestInterceptor?: (req: { url: string }) => { url: string };
  }
  export default function SwaggerUIBundle(options: SwaggerUIOptions): unknown;
}
