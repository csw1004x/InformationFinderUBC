import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "./IInsightFacade";

import * as pq from "./performQueryHelper";
import {SectionsList} from "../classes/SectionList"; // importing performQueryHelper

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

	public mockSectionList = new SectionsList("id", InsightDatasetKind.Sections);

	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// When id is invalid
		if (id.includes("_") || id === " " || id.length === 0 ||
			id === "\t" || id === "\n" || id === "\r" || id === "\f" || id === "\v") {
			return Promise.reject(new InsightError());
		}

		// When kind is not sections
		if (kind !== InsightDatasetKind.Sections) {
			return Promise.reject(new InsightError());
		}
		return Promise.resolve(["section1"]);  // stub
	}


	public isDataSetValid(data: any) {
		return true;
	}

	public removeDataset(id: string): Promise<string> {
		// When id is invalid
		if (id.includes("_") || id === " " || id.length === 0 ||
			id === "\t" || id === "\n" || id === "\r" || id === "\f" || id === "\v") {
			return Promise.reject(new InsightError());
		}

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

		// confirmed to have the basic components of a valid query.
		let knownQuery = query as any;

		// query.WHERE and its related variables
		let ifString: string = pq.bodyHelper(knownQuery["WHERE"]);
		let sectionInQuery = new Function("section", ifString);
		let sectionList: SectionsList = new SectionsList("id", InsightDatasetKind.Sections);

		// query.OPTIONS and its related variables
		let attributesString: string = pq.attributesHelper(knownQuery["OPTIONS"]);
		let orderString: string = pq.orderHelper(knownQuery["OPTIONS"]);

		// list to add successful query then sort
		let passedList = [];
		for (let section of sectionList.getSectionList) {

			if (sectionInQuery(section)) {
				// TODO: consider using the attribute here
				// 		 and even sorting for each push
				//		 i.e. could be pushing to priorityQueue
				passedList.push(section);
			}

			if (passedList.length > 5000) {
				return Promise.reject(ResultTooLargeError);
			}
		}

		return Promise.reject(new InsightError());
	}


	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
