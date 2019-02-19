import { Extractor, IExtractorConfig, IExtractorOptions } from "@microsoft/api-extractor";
import path from "path";
import { config } from "./common";


export const extractAPI = async () => {
    const extractorConfig: IExtractorConfig = {
        compiler: {
            configType: "tsconfig",
            rootFolder: ".",
        },
        project: {
            entryPointSourceFile: path.resolve(config.temp.path, config.temp.mainDTS),
        },
        apiReviewFile: {
            enabled: false,
        },
        apiJsonFile: {
            enabled: false,
        },
        dtsRollup: {
            enabled: true,
            trimming: false,
        },
    };

    const extractorOptions: IExtractorOptions = {
        localBuild: false,
    }

    const extractor = new Extractor(extractorConfig, extractorOptions);

    extractor.analyzeProject();
}
extractAPI.displayName = "extractAPI";
