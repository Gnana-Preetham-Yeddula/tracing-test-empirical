import express, { NextFunction, Request, Response } from 'express';
// import expressOasGenerator from 'express-oas-generator';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Logger } from './logger/Logger';
import { BaseController } from './controller/BaseController';
import { DI } from './di/DIContainer';
import { ErrorHandler } from './error/ErrorHandler';
// import { SetupRelations } from './data/entity/dbModels';
import Keycloak from 'keycloak-connect';
import session, { MemoryStore } from 'express-session';
import { FirstController } from './controller/FirstController';

const expressApp: express.Application = express();
// expressOasGenerator.init(expressApp, {});
const serviceName = 'empiri'


const tracer = initTracer(serviceName)
const opentracing = require('opentracing')
opentracing.initGlobalTracer(tracer)

const memoryStore = DI.get<MemoryStore>(MemoryStore);
const keycloak: Keycloak = DI.get(Keycloak, { store: memoryStore }, {
    clientId: process.env.KC_CLIENT_ID,
    bearerOnly: true,
    serverUrl: process.env.KC_HOST! + process.env.KC_AUTH_PATH!,
    realm: process.env.KC_REALM,
    "confidential-port": 0
});



function initTracer (serviceName:any) {
    const initJaegerTracer = require('jaeger-client').initTracerFromEnv
  
    // Sampler set to const 1 to capture every request, do not do this for production
    const config:any = {
      serviceName: serviceName
    }
    // Only for DEV the sampler will report every span
    config.sampler = { type: 'const', param: 1 }
  
    return initJaegerTracer(config)
  }


  function tracingMiddleWare (req:Request, res:Response, next:NextFunction) {
    const wireCtx = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers)
    // Creating our span with context from incoming request
    const span = tracer.startSpan(req.path, { childOf: wireCtx })
    // Use the log api to capture a log
    span.log({ event: 'request_received' })
  
    // Use the setTag api to capture standard span tags for http traces
    span.setTag(opentracing.Tags.HTTP_METHOD, req.method)
    span.setTag(opentracing.Tags.SPAN_KIND, opentracing.Tags.SPAN_KIND_RPC_SERVER)
    span.setTag(opentracing.Tags.HTTP_URL, req.path)
  
    // include trace ID in headers so that we can debug slow requests we see in
    // the browser by looking up the trace ID found in response headers
    const responseHeaders = {}
    tracer.inject(span, opentracing.FORMAT_HTTP_HEADERS, responseHeaders)
    res.set(responseHeaders)
  
    // add the span to the request object for any other handler to use the span
    Object.assign(req, { span })
  
    // finalize the span when the response is completed
    const finishSpan = () => {
      if (res.statusCode >= 500) {
        // Force the span to be collected for http errors
        span.setTag(opentracing.Tags.SAMPLING_PRIORITY, 1)
        // If error then set the span to error
        span.setTag(opentracing.Tags.ERROR, true)
  
        // Response should have meaning info to futher troubleshooting
        span.log({ event: 'error', message: res.statusMessage })
      }
      // Capture the status code
      span.setTag(opentracing.Tags.HTTP_STATUS_CODE, res.statusCode)
      span.log({ event: 'request_end' })
      console.log(span)
      span.finish()
    }
    res.on('finish', finishSpan)
    next()
  }
  

dotenv.config();

class Main {
    private logger: Logger;
    constructor() { 
        this.logger = DI.get(Logger);
    }

    initializeApplication() {
        this.registerControllers();
        this.startServer();
    }

    private initializeRepositories() {
        // SetupRelations();
    }

    private registerControllers() {
            this.initializeRepositories();
            expressApp.use(session({
                secret: 'mySecret',
                resave: false,
                saveUninitialized: true,
                store: memoryStore
            }));
            expressApp.use(cors());
            expressApp.use(bodyParser.urlencoded({extended: true}));
            expressApp.use(tracingMiddleWare)
            expressApp.use(bodyParser.json());
            expressApp.use(keycloak.middleware());
            expressApp.use((req, res, next) => {
                DI.destroy();
                next();
            })
            expressApp.use('/', DI.get<BaseController>(BaseController).getRouter());
            expressApp.use('/firstService',DI.get<FirstController>(FirstController).getRouter())
            expressApp.use(DI.get<ErrorHandler>(ErrorHandler).errorHandler);
    }
    

    private startServer() {
        expressApp.listen(process.env.PORT, () => {
            this.logger.log('Application Server Started');
        });
    }
}

const app = DI.get<Main>(Main);
app.initializeApplication();
