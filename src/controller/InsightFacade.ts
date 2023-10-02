import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError
} from "./IInsightFacade";

import JSZip from "jszip";
import {SectionsList} from "../classes/SectionsList";
import {Sections} from "../classes/Sections";
import * as fs from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

	constructor() {
		// console.log("InsightFacadeImpl::init()");
	}

	public allID: string[] = [];

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try{
			if (!this.isIDKindValid(id, kind)){
				return Promise.reject(new InsightError());
			}

			// check if id is already in allID
			if (this.allID.includes(id)){
				return Promise.reject(new InsightError());
			}

			const dataList = new SectionsList(id, kind);

			const zip = new JSZip();
			await zip.loadAsync(content, {base64: true});
			const coursesFolder = zip.folder("courses");

			// Check if there is a courses folder
			if (!coursesFolder) {
				return Promise.reject(new InsightError());
			}

			// Check if there are any files in the courses folder
			const files = coursesFolder.file(/.+/);	// regex to match any file name
			if (!files || files.length === 0) {
				return Promise.reject(new InsightError());
			}

			// Use Promise.all to process all files in parallel and store the results in an array
			const fileContentsPromises = files.map(async (file) => {
				const fileContent = await file.async("text");
				try {
					const fileJson = JSON.parse(fileContent);
					this.isDataValid(fileJson, dataList);
				} catch (err) {
					// skip
				}
			});

			await Promise.all(fileContentsPromises);

			if (dataList.getNumberOfSections() === 0 ){
				return Promise.reject(new InsightError());
			}
			this.allID.push(id);
			// print allId
			console.log(this.allID);
			await this.writeDataToDisk(dataList, id);

		} catch (err){
			return Promise.reject(new InsightError());
		}
		return this.allID;  // stub
	}

	private async writeDataToDisk(dataList: SectionsList, id: string): Promise<void> {
		const filename = id + ".json";
		const filePath = "./data/" + filename;

		try {
			// Convert the class instance to JSON string
			const jsonString = JSON.stringify(dataList);

			await fs.ensureDir("./data");
			// Write the JSON string to the file
			await fs.writeFileSync(filePath, jsonString);

			console.log(`Class instance has been written to ${filePath}`);
		} catch (err) {
			console.error(`Error writing class instance to ${filePath}: ${err}`);
		}

	}

	// A function named isDataValid that returns a boolean.
	// The function should take a JSON parsed object as an argument.
	// The function should return true if the JSON object contains all the fields we need.
	// The fields are: uuid, id, title, instructor, audit, year, pass, fail, avg, dept
	// If any field is missing, return false. Otherwise, return true.
	// all fields are in the result key.
	private isDataValid(jsonData: any, dataList: SectionsList): void {
		const requiredFields = ["id", "Course", "Title", "Professor",
			"Audit", "Year", "Pass", "Fail", "Avg", "Subject"];

		let isDataValid: boolean = true;
		for (let index in jsonData.result){
			isDataValid = true;
			for (const field of requiredFields) {
				if (!Object.prototype.hasOwnProperty.call(jsonData.result[index],field)) {
					isDataValid = false;
				}
			}
			if (isDataValid) {
				// insert data
				this.insertDataIntoSectionsList(jsonData.result[index], dataList);
				// console.log(jsonData.result[index]);
			}
		}
	}

	private insertDataIntoSectionsList(jsonData: any, datalist: SectionsList): void {
		let sectionUUID: string = jsonData["id"].toString();
		let sectionID: string = jsonData["Course"].toString();
		let sectionTitle: string = jsonData["Title"].toString();
		let sectionInstructor: string = jsonData["Professor"].toString();
		let sectionDept: string = jsonData["Subject"].toString();

		let tmp: string = jsonData["Year"].toString();
		let sectionYear: number;
		if (tmp === "overall"){
			sectionYear = 1900;
		} else {
			sectionYear = Number(jsonData["Year"]);
		}

		let sectionAvg: number = Number(jsonData["Avg"]);
		let sectionPass: number = Number(jsonData["Pass"]);
		let sectionFail: number = Number(jsonData["Fail"]);
		let sectionAudit: number = Number(jsonData["Audit"]);

		const section = new Sections(sectionUUID, sectionID, sectionTitle, sectionInstructor,
			sectionDept, sectionYear, sectionAvg, sectionPass, sectionFail, sectionAudit);

		// section.printALlFields();

		datalist.addSection(section);
	}

	private isIDKindValid(id: string,  kind: InsightDatasetKind): boolean {
		// When id is invalid
		// catch 2+ white spaces
		if (id.includes("_") || id === " " || id.length === 0 ||
			id === "\t" || id === "\n" || id === "\r" || id === "\f" || id === "\v") {
			return false;
		}

		// When kind is not sections
		return kind === InsightDatasetKind.Sections;


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

	/**
	 * @param query  The query to be performed.
	 * @return Promise <InsightResult[]>
	 */
	public async performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject(new InsightError());
	}

}
