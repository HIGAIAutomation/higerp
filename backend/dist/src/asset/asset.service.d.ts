import { PrismaService } from '../prisma/prisma.service';
export declare class AssetService {
    private prisma;
    constructor(prisma: PrismaService);
    createAsset(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        name: string;
        assignedTo: string | null;
        type: string;
        serialNumber: string | null;
        purchaseDate: Date | null;
    }>;
    getAssets(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        status: string;
        name: string;
        assignedTo: string | null;
        type: string;
        serialNumber: string | null;
        purchaseDate: Date | null;
    }[]>;
}
