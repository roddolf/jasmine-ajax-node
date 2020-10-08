import { Extractor, ExtractorConfig, ExtractorLogLevel, ExtractorResult } from "@microsoft/api-extractor";
import path from "path";
import { config } from "./common";


export const extractAPI = async () => {
    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
        configObject: {
            apiReport: {
                enabled: false,
                reportFileName: config.packageName + ".api.md",
            },
            compiler: {
                tsconfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
            },
            dtsRollup: {
                enabled: true,
                untrimmedFilePath: path.resolve(config.dist.path, config.dist.mainDTS),
            },
            mainEntryPointFilePath: path.resolve(config.temp.path, config.temp.mainDTS),
            messages: {
                compilerMessageReporting: {
                    default: {
                        logLevel: ExtractorLogLevel.Warning,
                    },
                },
                extractorMessageReporting: {
                    default: {
                        logLevel: ExtractorLogLevel.Warning,
                    },
                },
                tsdocMessageReporting: {
                    default: {
                        logLevel: ExtractorLogLevel.Warning,
                    },
                },
            },
            projectFolder: path.resolve(__dirname, "../"),
        },
        configObjectFullPath: undefined,
        packageJsonFullPath: path.resolve(__dirname, "../package.json"),
    });

    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: true,
    });

    if (!extractorResult.succeeded) {
        return Promise.reject(
            `API Extractor completed with ${extractorResult.errorCount} errors`
            + ` and ${extractorResult.warningCount} warnings`,
        );
    }
};
extractAPI.displayName = "extractAPI";
