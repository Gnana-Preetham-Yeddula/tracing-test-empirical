import express from 'express';
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

const expressApp: express.Application = express();
// expressOasGenerator.init(expressApp, {});

const memoryStore = DI.get<MemoryStore>(MemoryStore);
const keycloak: Keycloak = DI.get(Keycloak, { store: memoryStore }, {
    clientId: process.env.KC_CLIENT_ID,
    bearerOnly: true,
    serverUrl: process.env.KC_HOST! + process.env.KC_AUTH_PATH!,
    realm: process.env.KC_REALM,
    "confidential-port": 0
});

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
            expressApp.use(bodyParser.json());
            expressApp.use(keycloak.middleware());
            expressApp.use((req, res, next) => {
                DI.destroy();
                next();
            })
            expressApp.use('/', keycloak.protect(), DI.get<BaseController>(BaseController).getRouter());
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
