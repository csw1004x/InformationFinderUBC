import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import * as fs from "fs-extra";
import * as bd from "./bodyHelper";
import InsightFacade from "./InsightFacade";

// validate query
// return true if the query is valid, false if invalid
export function queryValidator(query: unknown): boolean {
	// check query data type
	if (query === null || query === undefined || query === "" || typeof query !== "object") {
		throw new InsightError();
	}

	// check it contains two mandatory components: WHERE and OPTIONS
	if (!("WHERE" in query && "OPTIONS" in query)) {
		throw new InsightError();
	}

	return true;
}

export async function getSections(searchID: string) {
	let dataDir = "./data";
	await fs.ensureDir(dataDir);
	let facade = new InsightFacade();
	let datas = await facade.listDatasets();

	// if corresponding data is found, load it to parsedJSON
	let parsedJSON;
	for (let data of datas) {
		if (data.id === searchID) {
			let filePath = "./data/" + data.id + ".json";
			let fileContent = fs.readFileSync(filePath);
			parsedJSON = JSON.parse(fileContent.toString());
		}
	}
	return parsedJSON;
}

export function getID(query: any): string {
	let idSet: Set<string> = new Set<string>();
	getIDBody(query, idSet);

	if (idSet.size !== 1) {
		throw new InsightError();
	}

	let id: string = "";
	for (const value of idSet.values()) {
		id = value;
	}

	if (id === "") {
		throw new InsightError();
	}

	return id;
}

function getIDBody(query: any, idSet: Set<string>): string {
	try {
		let queryObject = query as any;
		let keys: string[] = Object.keys(queryObject);

		let LOGIC = ["AND", "OR"];
		let COMPARATOR = ["LT", "GT", "EQ", "IS"];
		let NEGATION = "NOT";

		for (const key of keys) {
			if (LOGIC.includes(key)) {
				for (let q of queryObject[key]) {
					getIDBody(q, idSet);
				}
			} else if (COMPARATOR.includes(key)) {
				getIDComparator(queryObject[key], idSet);
			} else if (key === NEGATION) {
				getIDBody(queryObject[key], idSet);
			} else {
				throw new Error();
			}
		}
		return "";
	} catch (error) {
		console.log("error caught at getIDBody");
		throw new InsightError();
	}
}

// REQUIRE: query is of comparator
function getIDComparator(sDict: any, idSet: Set<string>): string {
	let sKey = Object.keys(sDict)[0];
	let sKeyList = sKey.split("_");
	let idString = sKeyList[0];
	idSet.add(idString);

	return idString;
}

// throws exception if any error is found
// return true for testability
export function columnsValidator(query: any, id: string): boolean {
	if (query === undefined || query.length === 0) {
		throw new InsightError();
	}

	let validKeys = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
	for (let col of query) {
		let keyList = col.split("_");
		let idString = keyList[0];
		let field = keyList[1];

		if (idString !== id) {
			throw new InsightError();
		}
		if (!validKeys.includes(field)) {
			throw new InsightError();
		}
	}

	return true;
}

export function optionsValidator(query: any): boolean {
	let allowedFields = ["COLUMNS", "ORDER"];
	for (let key in query) {
		if (!allowedFields.includes(key)) {
			throw new InsightError();
		}
	}
	return true;
}

export function orderValidator(query: any, id: string): boolean {
	if (query === undefined) {
		return false;
	}
	let keyList = query.split("_");
	let idString = keyList[0];
	let field = keyList[1];

	if (idString !== id) {
		throw new InsightError();
	}

	return true;
}

export function filterWhere(parsedJSON: any, knownQuery: any): any[] {
	let ifCondition: string = "return " + bd.bodyHelper(knownQuery["WHERE"]);
	let queryMatches = new Function("section", ifCondition);
	let filteredJSON = [];

	// filter based on the WHERE conditions
	// filteredJSON contains the JSONs that passed WHERE
	for (let section of parsedJSON.sectionList) {
		if (queryMatches(section)) {
			filteredJSON.push(section);
		}
	}
	return filteredJSON;
}

export function filterOptions(whereFilteredJSON: any, knownQuery: any, idString: string): InsightResult[] {
	optionsValidator(knownQuery["OPTIONS"]);
	columnsValidator(knownQuery["OPTIONS"]["COLUMNS"], idString);
	let passedList: InsightResult[] = [];

	// for each section, if it matches query, create InsightResult and add to list
	for (let section of whereFilteredJSON) {

		if (passedList.length >= 5000) {
			throw new ResultTooLargeError();
		}

		let passedSection: InsightResult = {};
		for (let col of knownQuery["OPTIONS"]["COLUMNS"]) {
			let field = col.split("_")[1];
			passedSection[col] = section[field];
		}
		passedList.push(passedSection);
	}
	return passedList;
}
