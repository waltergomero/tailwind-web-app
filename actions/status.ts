'use server';

import { addStatusFormSchema, updateStatusFormSchema} from "@/schemas/schemaValidation";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Status from "@/models/status";
import connectDB from "@/config/database";
import { convertToPlainObject } from "@/lib/utils";

export interface StatusData {
  _id: string;
  status_name: string;
  type_id: string;
  description: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * get all statuses from the database
 */
export async function fetchAllStatuses(): Promise<{ data: StatusData[] }> {
    try {
        await connectDB();
        const statuses = await Status.find().sort({ createdAt: -1 });
        const plainStatuses = statuses.map(convertToPlainObject);
        return {
            data: plainStatuses as StatusData[],
        };
    } catch (error) {
        console.error("Error fetching statuses:", error);
        return {
            data: [],
        };
    }
}