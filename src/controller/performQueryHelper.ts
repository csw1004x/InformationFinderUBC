import {InsightDataset, InsightError, InsightResult} from "./IInsightFacade";
import * as fs from "fs-extra";
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

export function bodyHelper(query: any): string {
	try {
		let queryObject = query as any;
		let keys: string[] = Object.keys(queryObject);
		let blockString: string = "";

		let LOGIC = ["AND", "OR"];
		let MCOMPARATOR = ["LT", "GT", "EQ"];
		let SCOMPARATOR = "IS";
		let NEGATION = "NOT";

		for (const key of keys) {
			if (LOGIC.includes(key)) {
				blockString += logicHelper(queryObject[key], key);
			} else if (MCOMPARATOR.includes(key)) {
				blockString += mComparatorHelper(queryObject[key], key);
			} else if (key === SCOMPARATOR) {
				blockString += sComparatorHelper(queryObject[key], key);
			} else if (key === NEGATION) {
				blockString += "!";
				blockString += bodyHelper(queryObject[key]);
			} else {
				throw new Error();
			}
		}
		return blockString;
	} catch (error) {
		console.log("error caught at bodyHelper");
		throw new InsightError();
	}
}

// REQUIRE: query needs to follow LOGICCOMPARISON
// filterList: list of filters
// logic: "AND" | "OR"
export function logicHelper(filterList: any, logic: string): string {
	// let queryObject = filterList as any;
	// let keys: string[] = Object.keys(queryObject);

	let blockString: string = "(";
	let conjunction: string;

	if (logic === "AND") {
		conjunction = " && ";
	} else {
		conjunction = " || ";
	}

	for (let i = 0; i < filterList.length; i++) {
		blockString += bodyHelper(filterList[i]);
		if (i !== filterList.length - 1) {
			blockString += conjunction;
		}
	}

	return blockString + ")";
}

// REQUIRE: query is of scomparator
export function sComparatorHelper(sDict: any, key: string): string {
	let blockString: string = "(";
	let sKey = Object.keys(sDict)[0];
	let inputstring = sDict[sKey];
	let sKeyList = sKey.split("_");
	let idstring = sKeyList[0];
	let sfield = sKeyList[1];

	blockString += "section." + sfield;

	// check field validity
	if (!["dept", "id", "instructor", "title", "uuid"].includes(sfield)) {
		throw new InsightError();
	}

	if (inputstring.startsWith("*")) {
		if (inputstring.endsWith("*")) {
			blockString += '.includes("' + inputstring.slice(1, -1) + '")';
		} else {
			blockString += '.endsWith("' + inputstring.slice(1) + '")';
		}
	} else if (inputstring.endsWith("*")) {
		blockString += '.startsWith("' + inputstring.slice(0, inputstring.length - 1) + '")';
	} else if (inputstring.includes("*")) {
		throw new InsightError();
	} else {
		blockString += ' === "' + inputstring.slice() + '"';
	}
	return (blockString += ")");
}

// REQUIRE: query is of mcomparator
export function mComparatorHelper(mDict: any, key: string): string {
	try {
		let blockString: string = "(";
		let mKey = Object.keys(mDict)[0];
		let mNumber = mDict[mKey];
		let mKeyList = mKey.split("_");
		let idstring = mKeyList[0];
		let mfield = mKeyList[1];

		// check field validity
		if (!["avg", "pass", "fail", "audit", "year"].includes(mfield)) {
			throw new InsightError();
		}

		blockString += "section." + mfield;

		if (key === "GT") {
			blockString += " > ";
		} else if (key === "LT") {
			blockString += " < ";
		} else if (key === "EQ") {
			blockString += " === ";
		} else {
			throw new InsightError();
		}

		blockString += mNumber;

		// throw new Error();
		return blockString + ")"; // stub
	} catch (error) {
		console.log("error caught at mComparatorHelper");
		throw new InsightError();
	}
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
