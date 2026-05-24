import { z } from "zod";
import { litigationQualityFlagSchema } from "./document-extraction.schema";

export type LitigationQualityFlag = z.infer<typeof litigationQualityFlagSchema>;
