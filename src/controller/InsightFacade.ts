import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError
} from "./IInsightFacade";
import JSZip from "jszip";
import {SectionsList} from "../classes/SectionList";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
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
			this.allID.push(id);

			const zip = new JSZip();
			await zip.loadAsync(content, {base64: true});
			const coursesFolder = zip.folder("courses");

			// Check if there is a courses folder
			if (!coursesFolder) {
				console.log("No courses folder found.");
				return Promise.reject(new InsightError());
			}

			// Check if there are any files in the courses folder
			const files = coursesFolder.file(/.+/);	// regex to match any file name
			if (!files || files.length === 0) {
				console.log("No files found in the /courses folder.");
				return Promise.reject(new InsightError());
			}

			// Use Promise.all to process all files in parallel and store the results in an array
			const fileContentsPromises = files.map(async (file) => {
				const fileContent = await file.async("text");
				try {
					const fileJson = JSON.parse(fileContent);
					// add data here?
					// year = 1980 is overall
					// convert year from string into number
					// uuid?? (check)
					// while ur adding if field isnt there just bail
					this.isDataValidAndInsert(fileJson);
				} catch (err) {
					console.log("Invalid json file.");
				}
			});

			await Promise.all(fileContentsPromises);

		} catch (err){
			return Promise.reject(new InsightError());
		}
		return Promise.resolve(["section1"]);  // stub
	}

	// Write a function named isDataValid that returns a boolean.
	// The function should take a JSON parsed object as an argument.
	// The function should return true if the JSON object contains all the fields we need.
	// The fields are: uuid, id, title, instructor, audit, year, pass, fail, avg, dept
	// If any field is missing, return false. Otherwise, return true.
	// all fields are in the result key.
	private isDataValidAndInsert(jsonData: any): void {
		const requiredFields = ["id", "Course", "Title", "Professor",
			"Audit", "Year", "Pass", "Fail", "Avg", "Subject"];
		for (let index in jsonData.result){
			// console.log(jsonData.result[index]);
			for (const field of requiredFields) {
				if (!Object.prototype.hasOwnProperty.call(jsonData.result[index],field)) {
					continue;
				}
			}
		}
	}

	private isIDKindValid(id: string,  kind: InsightDatasetKind): boolean {
		// When id is invalid
		// catch 2+ white spaces
		if (id.includes("_") || id === " " || id.length === 0 ||
			id === "\t" || id === "\n" || id === "\r" || id === "\f" || id === "\v") {
			return false;
		}

		// When kind is not sections
		if (kind !== InsightDatasetKind.Sections) {
			return false;
		}

		return true;
	}

	// Write the function named writeToDisk that writes the SectionsList into a file.
	// The function should take a SectionsList object as an argument.
	// The function should return a Promise that resolves to a boolean.
	// The function should write the SectionsList into a file named id.json.
	// The function should return true if the file is written successfully.
	// Otherwise, return false.

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
