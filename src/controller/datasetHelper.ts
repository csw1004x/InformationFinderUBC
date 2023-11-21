import {InsightDatasetKind} from "./IInsightFacade";
import * as fs from "fs-extra";
import {SectionsList} from "../classes/SectionsList";
import {Sections} from "../classes/Sections";

export async function writeDataToDisk(dataList: any, id: string): Promise<void> {
	const filename = id + ".json";
	const filePath = "./data/" + filename;

	try {
		// Convert the class instance to JSON string
		const jsonString = JSON.stringify(dataList);

		await fs.ensureDir("./data");
		// Write the JSON string to the file
		fs.writeFileSync(filePath, jsonString);

		// console.log(`Class instance has been written to ${filePath}`);
	} catch (err) {
		// console.error(`Error writing class instance to ${filePath}: ${err}`);
	}
}

// A function named addID that adds the list of ids into a .json file located in ./id_list
export async function updateID(): Promise<string[]> {
	// // check if ./id_list exists if not create it
	// const dirPath = "./id_list";
	// await fs.ensureDir(dirPath);
	//
	// // check if idList.json exists in ./id_list, if not create it, if it does, append the id to the list
	// const filePath = "./id_list/idList.json";
	let idList: string[] = [];

	// go to ./data and parse the names of the files and remove the .json at the end
	const dataPath = "./data";
	let dataFiles: string[] = [];
	try {
		dataFiles = await fs.readdir(dataPath);
	} catch (err) {
		// console.error(`Error reading directory ${dataPath}: ${err}`);
	}

	for (let file of dataFiles) {
		let tmp = file.split(".");
		// add the id to the idList if it is not already in there
		idList.push(tmp[0]);
	}


	return Promise.resolve(idList);
}

// A function named isDataValid that returns a boolean.
// The function should take a JSON parsed object as an argument.
// The function should return true if the JSON object contains all the fields we need.
// The fields are: uuid, id, title, instructor, audit, year, pass, fail, avg, dept
// If any field is missing, return false. Otherwise, return true.
// all fields are in the result key.
export function isDataValid(jsonData: any, dataList: SectionsList): void {
	const requiredFields = ["id", "Course", "Title", "Professor", "Audit", "Year", "Pass", "Fail", "Avg", "Subject"];

	let valid: boolean = true;
	for (let index in jsonData.result) {
		valid = true;
		for (const field of requiredFields) {
			if (!Object.prototype.hasOwnProperty.call(jsonData.result[index], field)) {
				valid = false;
			}
		}
		if (valid) {
			// insert data
			insertDataIntoSectionsList(jsonData.result[index], dataList);
			// console.log(jsonData.result[index]);
		}
	}
}

export function insertDataIntoSectionsList(jsonData: any, datalist: SectionsList): void {
	let sectionUUID: string = jsonData["id"].toString();
	let sectionID: string = jsonData["Course"].toString();
	let sectionTitle: string = jsonData["Title"].toString();
	let sectionInstructor: string = jsonData["Professor"].toString();
	let sectionDept: string = jsonData["Subject"].toString();

	let tmp: string = jsonData["Section"].toString();
	let sectionYear: number;
	if (tmp === "overall") {
		sectionYear = 1900;
	} else {
		sectionYear = Number(jsonData["Year"]);
	}

	let sectionAvg: number = Number(jsonData["Avg"]);
	let sectionPass: number = Number(jsonData["Pass"]);
	let sectionFail: number = Number(jsonData["Fail"]);
	let sectionAudit: number = Number(jsonData["Audit"]);

	const section = new Sections(
		sectionUUID,
		sectionID,
		sectionTitle,
		sectionInstructor,
		sectionDept,
		sectionYear,
		sectionAvg,
		sectionPass,
		sectionFail,
		sectionAudit
	);

	// section.printALlFields();

	datalist.addSection(section);
}

export function isIDKindValid(id: string, kind: InsightDatasetKind): boolean {
	// When id is invalid
	// catch 2+ white spaces
	if (
		id.includes("_") ||
		id === " " ||
		id.length === 0 ||
		id === "\t" ||
		id === "\n" ||
		id === "\r" ||
		id === "\f" ||
		id === "\v"
	) {
		return false;
	}

	// When kind is not sections
	return (kind === InsightDatasetKind.Sections) || (kind === InsightDatasetKind.Rooms);
}
