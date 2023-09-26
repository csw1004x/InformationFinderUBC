import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError
} from "./IInsightFacade";
import * as fs from "fs-extra";

import * as pq from "./performQueryHelper"; // importing performQueryHelper

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.resolve(["section1"]);  // stub
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	/**
	 * @param query  The query to be performed.
	 * @return Promise <InsightResult[]>
	 */
	public async performQuery(query: unknown): Promise<InsightResult[]> {
		// Instruction:
		// Take in: JSON query
		// Parse: JSON query
		// Validate: JSON query (syntactically / semantically)

		// Return:
		// Promise to fulfill with array of results

		// Reject:
		// if a query is too large -> ResultTooLargeError

		let datasets = await this.listDatasets();
		if (!pq.isValidQuery(query, datasets)) {
			return Promise.reject(InsightError);
		}

		return Promise.reject(new InsightError());
	}


	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
