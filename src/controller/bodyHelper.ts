import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import * as fs from "fs-extra";
import * as bd from "./bodyHelper";
import InsightFacade from "./InsightFacade";

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
