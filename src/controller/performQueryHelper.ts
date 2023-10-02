import {InsightDataset} from "./IInsightFacade";

// validate query
// return true if the query is valid, false if invalid
export function isValidQuery(query: unknown, datasets: InsightDataset[]): boolean {
	// Reject:
	// 1. if a query is incorrectly formatted -> InsightError
	// 2. if a query references a dataset not added (in mem or disk) -> InsightError
	// 3. if a query references multiple datasets -> InsightError

	// check query data type
	if (query === null || query === undefined || typeof query !== "object") {
		return false;
	}

	// check it contains two mandatory components: WHERE and OPTIONS
	if (!("WHERE" in query && "OPTIONS" in query)) {
		return false;
	}

	// dataset validity check
	for (let dataset of datasets) {
		// below code for debugging purpose only
		// console.log(dataset.id);
	}
	return true;
}
