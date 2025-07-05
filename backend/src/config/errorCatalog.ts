import { ErrorCatalog, IErrorBaseCode } from './typedErrors'

const errorCatalog: ErrorCatalog = require('./error.json');

export function getError(type: string, location: string) {
    
    if (!(type in errorCatalog)) {
        throw new Error(`Unknown key ${type} has been searched`);
    }

    const groupError = errorCatalog[type];
    const locationError: IErrorBaseCode = groupError[location]

    if (!locationError)
        throw new Error(`Unknown location ${location} in error type ${type}`);

    return locationError;
    
}