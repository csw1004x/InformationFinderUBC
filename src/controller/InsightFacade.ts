import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError
} from "./IInsightFacade";

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
		// When id is invalid
		if(id.includes("_") || id === " " || id.length === 0 ||
			id === "\t" || id === "\n" || id === "\r" || id === "\f" || id === "\v"){
			return Promise.reject(new InsightError());
		}

		// When kind is not sections
		if (kind !== InsightDatasetKind.Sections){
			return  Promise.reject(new InsightError());
		}
		return Promise.resolve(["section1"]);  // stub
	}


	public isDataSetValid(data: any){
		return true;
	}

	public removeDataset(id: string): Promise<string> {
		// When id is invalid
		if(id.includes("_") || id === " " || id.length === 0 ||
			id === "\t" || id === "\n" || id === "\r" || id === "\f" || id === "\v"){
			return Promise.reject(new InsightError());
		}

		return Promise.reject("Not implemented.");
	}


	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject(new InsightError());
	}
}
