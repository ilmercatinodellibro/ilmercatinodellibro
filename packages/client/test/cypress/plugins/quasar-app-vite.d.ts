/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@quasar/app-vite/lib/app-extension/extensions-runner" {
  interface ExtensionRunner {
    registerExtensions(ctx: any): Promise<void>;
  }

  const extensionRunner: ExtensionRunner;
  export default extensionRunner;
}

declare module "@quasar/app-vite/lib/helpers/get-quasar-ctx" {
  const getQuasarCtx: (options: Record<string, any>) => Record<string, any>;
  export default getQuasarCtx;
}

declare module "@quasar/app-vite/lib/quasar-config-file" {
  class QuasarConfFile {
    constructor(options: {
      ctx: Record<string, any>;
      host?: string;
      port?: number;
    });

    read(): Promise<Record<string, any>>;
  }

  export default QuasarConfFile;
}

declare module "@quasar/app-vite/lib/modes/spa/spa-config" {
  const generateConfig: { vite: (quasarConf: Record<string, any>) => any };
  export default generateConfig;
}
