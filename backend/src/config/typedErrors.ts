export interface IErrorBaseCode {
    code: string;
    messageId: string;
    status: string | number;
}

export type ErrorCatalog = {
    [category: string]: {
        [location: string]: IErrorBaseCode
    }
}