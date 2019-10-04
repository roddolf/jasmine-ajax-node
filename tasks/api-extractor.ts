import {Extractor, ExtractorConfig, ExtractorLogLevel, ExtractorResult} from "@microsoft/api-extractor";
import path from "path";
import {config} from "./common";


export const extractAPI = async () => {
    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
        configObjectFullPath: undefined,
        packageJsonFullPath: path.resolve(__dirname, "../package.json"),
        configObject: {
            projectFolder: path.resolve(__dirname, "../"),
            mainEntryPointFilePath: path.resolve(config.temp.path, config.temp.mainDTS),
            compiler: {
                tsconfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
            },
            dtsRollup: {
                enabled: true,
                untrimmedFilePath: path.resolve(config.dist.path, config.dist.mainDTS),
            },
            apiReport: {
                enabled: false,
                reportFileName: config.packageName + ".api.md",
            },
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
            }
        },
    });

    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: true,
    });

    if (!extractorResult.succeeded) {
        return Promise.reject(
            `API Extractor completed with ${extractorResult.errorCount} errors`
            + ` and ${extractorResult.warningCount} warnings`
        );
    }
};
extractAPI.displayName = "extractAPI";
