import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { type Express } from 'express';
import { join } from 'node:path';
import { handleCreateServer } from './proxy-server/server';

const app = express();

const StartServer = async () => {

  const browserDistFolder = join(import.meta.dirname, '../browser');
  const angularApp = new AngularNodeAppEngine();

  const proxyServer = await handleCreateServer();
  app.use(proxyServer);

  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
    }),
  );

  app.use((req, res, next) => {
    angularApp
      .handle(req)
      .then((response) =>
        response ? writeResponseToNodeResponse(response, res) : next(),
      )
      .catch(next);
  });

  if (isMainModule(import.meta.url) || process.env['pm_id']) {
    const port = process.env['PORT'] || 4000;
    app.listen(port, (error) => {
      if (error) {
        throw error;
      }

      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  }


}

StartServer();

export const reqHandler = createNodeRequestHandler(app);
