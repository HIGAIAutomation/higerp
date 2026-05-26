import { AssetService } from './asset.service';
export declare class AssetController {
    private assetService;
    constructor(assetService: AssetService);
    createAsset(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        name: string;
        assignedTo: string | null;
        type: string;
        serialNumber: string | null;
        purchaseDate: Date | null;
    }>;
    getAssets(req: any): Promise<{
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
