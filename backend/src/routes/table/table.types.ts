export type TableTypeRequestBody = {
    tables: {
        seats?: number;
        labelTable: string;
        qrCodeId?: string;
        tableGroupId?: string; // Optional group ID for table grouping
    }[];   
}