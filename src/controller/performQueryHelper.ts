import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import * as fs from "fs-extra";
import * as bd from "./bodyHelper";
import * as tf from "./transformHelper";
import InsightFacade from "./InsightFacade";


const validSectionsKeys = [
	"avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
const validRoomsKeys = [
	"fullname", "shortname", "number", "name", "address", "lat", "lon", "seats", "type", "furniture", "href"];
const validSections = ["sections", "rooms"];

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

export async function getJSON(searchID: string) {
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
	getIDBody(query["WHERE"], idSet);
	try {
		getIDOptions(query["OPTIONS"]["COLUMNS"], idSet);
	} catch (e) {
		// columns not found - it's ok. moving on.
	}

	try {
		getIDOptions(query["TRANSFORMATIONS"]["GROUP"], idSet);
	} catch (e) {
		// columns not found - it's ok. moving on.
	}

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

function getIDOptions(query: any, idSet: Set<string>): void {
	for (let key of query) {
		let keyList = key.split("_");
		if (keyList.length > 1 && validSections.includes(keyList[0])) {
			idSet.add(keyList[0]);
		}
	}
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

	for (let col of query) {
		let keyList = col.split("_");
		if (keyList.length > 1) {
			let idString = keyList[0];
			let field = keyList[1];

			if (idString !== id) {
				throw new InsightError();
			}
			if (idString === "Sections" && !validSectionsKeys.includes(field)) {
				throw new InsightError();
			} else if (idString === "Rooms" && !validRoomsKeys.includes(field)) {
				throw new InsightError();
			}
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

export function filterWhere(parsedJSON: any, knownQuery: any): any[] {
	let ifCondition: string;

	if (JSON.stringify(knownQuery["WHERE"]) === "{}") {
		ifCondition = "return true";
	} else {
		ifCondition = "return " + bd.bodyHelper(knownQuery["WHERE"]);
	}

	let queryMatches = new Function("element", ifCondition);
	let filteredJSON = [];

	// filter based on the WHERE conditions
	// filteredJSON contains the JSONs that passed WHERE
	if (Object.keys(parsedJSON)[0] === "roomsList") {
		for (let room of parsedJSON.roomsList) {
			if (queryMatches(room)) {
				filteredJSON.push(room);
			}
		}
	} else if (Object.keys(parsedJSON)[0] === "sectionList") {
		for (let section of parsedJSON.sectionList) {
			if (queryMatches(section)) {
				filteredJSON.push(section);
			}
		}
	}
	return filteredJSON;
}

export function filterOptions(whereFilteredJSON: any, knownQuery: any, idString: string): InsightResult[] {
	optionsValidator(knownQuery["OPTIONS"]);
	columnsValidator(knownQuery["OPTIONS"]["COLUMNS"], idString);
	let passedList: InsightResult[] = [];

	// for each section, if it matches query, create InsightResult and add to list
	for (let obj of whereFilteredJSON) {

		if (passedList.length >= 5000) {
			throw new ResultTooLargeError();
		}

		let passedSection: InsightResult = {};

		// query always comes in as "<group>_<field>" or "transformed_name"
		// object may have "field", "<group>_<field>" or "transformed_name"
		for (let col of knownQuery["OPTIONS"]["COLUMNS"]) {
			let value: any = obj[col];
			if (value === undefined) {
				let keyList = col.split("_");
				value = obj[keyList[1]];
			}

			if (value === undefined) {
				throw new InsightError();
			}

			passedSection[col] = value;
		}
		passedList.push(passedSection);
	}
	return passedList;
}

export function transform(filteredJSON: any, knownQueryTransformations: any): any[] {
	if (knownQueryTransformations === undefined) {
		return filteredJSON;
	}

	let appliedJSON: any[] = [];
	// GROUP
	let groupedJSON = tf.groupHelper(filteredJSON, knownQueryTransformations["GROUP"]);

	// APPLY
	for (let key in groupedJSON) {
		let group = groupedJSON[key];
		let result: any = {};

		// populate the non-transformed columns
		for (let col of knownQueryTransformations["GROUP"]) {
			result[col] = group[0][col.split("_")[1]];
		}

		// populate the transformed columns
		let finalResults = {...result, ...tf.applyHelper(group, knownQueryTransformations["APPLY"])};
		appliedJSON.push(finalResults);
	}
	// console.log(appliedJSON);
	// return filteredJSON;
	return appliedJSON;
}

export function sortQuery(passedList: any, knownQuery: any): any {
	let orderColumn = knownQuery["OPTIONS"]["ORDER"];
	// check if order condition exists
	if (orderColumn === undefined) {
		return passedList;
	}
	// sort condition checks
	if (passedList.length <= 1) {
		return passedList;
	}
	// console.log(passedList);
	// case 1 - sort by single column
	if (typeof orderColumn === "string") {
		if (passedList[0][orderColumn] === undefined) {
			throw new InsightError();
		}
		passedList.sort((a: any, b: any) => (a[orderColumn] < b[orderColumn] ? -1 : 1));

		// case 2 - sort by more descriptions
	} else if (orderColumn["dir"] && orderColumn["keys"]) {
		// ensuring all order keys are in columns
		for (let key of orderColumn["keys"]) {
			if (passedList[0][key] === undefined) {
				throw new InsightError();
			}
		}
		passedList.sort((a: any, b: any) => {
			let direction: number = orderColumn["dir"] === "DOWN" ? 1 : -1;
			// comparing
			for (let key of orderColumn["keys"]) {
				// console.log("a[key]: " + a[key] + " < b[key]: " + b[key] + " = " + String(a[key] < b[key]));
				if (a[key] < b[key]) {
					// console.log("return: " + direction);
					return direction;
				} else if (a[key] > b[key]) {
					// console.log("return: " + (direction * -1));
					return -direction;
				}
			}
			return 0;
		});
	} else {
		throw new InsightError();
	}
	return passedList;
}
