export type TableTypeRequestBody = {
    tables: {
        seats?: number;
        labelTable: string;
        qrCodeId?: string;
    }[];   
}