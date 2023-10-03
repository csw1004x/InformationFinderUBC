import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

import JSZip from "jszip";
import {SectionsList} from "../classes/SectionsList";
import * as fs from "fs-extra";
import * as pq from "./performQueryHelper";
import * as ds from "./datasetHelper";

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
		try {
			if (!ds.isIDKindValid(id, kind)) {
				return Promise.reject(new InsightError());
			}

			// check if id is already in allID
			if (this.allID.includes(id)) {
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

			const files = coursesFolder.file(/.+/); // regex to match any file name
			if (!files || files.length === 0) {
				return Promise.reject(new InsightError());
			}

			// Use Promise.all to process all files in parallel and store the results in an array
			const fileContentsPromises = files.map(async (file) => {
				const fileContent = await file.async("text");
				try {
					const fileJson = JSON.parse(fileContent);
					ds.isDataValid(fileJson, dataList);
				} catch (err) {
					// skip
				}
			});

			await Promise.all(fileContentsPromises);

			if (dataList.getNumberOfSections() === 0) {
				return Promise.reject(new InsightError());
			}
			this.allID.push(id);
			// print allId
			// console.log(this.allID);
			await ds.writeDataToDisk(dataList, id);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
		return this.allID; // stub
	}

	public removeDataset(id: string): Promise<string> {
		// When id is invalid
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
			return Promise.reject(new InsightError());
		}

		// When id is not in allID
		if (!this.allID.includes(id)) {
			return Promise.reject(new NotFoundError());
		}

		const filename = id + ".json";
		const filePath = "./data/" + filename;
		fs.remove(filePath).then().catch();

		// remove id from allID
		const index = this.allID.indexOf(id);
		if (index > -1) {
			this.allID.splice(index, 1);
		}

		return Promise.resolve(id);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		const datasetList: InsightDataset[] = [];
		const dataDir = "./data";

		try {
			await fs.ensureDir(dataDir);
			const files = fs.readdirSync(dataDir);

			// Create an array of promises to read and parse the JSON files concurrently
			const filePromises = files.map(async (file) => {
				const id = file.split(".")[0];
				const kind = InsightDatasetKind.Sections;
				let numRows = 0;

				try {
					const filePath = `${dataDir}/${file}`;
					const fileContents = await fs.readFile(filePath, "utf8");
					const jsonData = JSON.parse(fileContents);

					if (jsonData && jsonData.sectionList && Array.isArray(jsonData.sectionList)) {
						numRows = jsonData.sectionList.length;
					}
				} catch (error) {
					// Handle errors here, or skip as needed
				}
				// console.log(id, kind, numRows);
				// Check if numRows is greater than 0 before pushing to the datasetList
				if (numRows > 0) {
					datasetList.push({id, kind, numRows});
				}
			});

			// Wait for all file promises to resolve
			await Promise.all(filePromises);
		} catch (error) {
			// don't need to handle for list
		}
		return Promise.resolve(datasetList);
	}

	/**
	 * @param query  The query to be performed.
	 * @return Promise <InsightResult[]>
	 */
	public async performQuery(query: unknown): Promise<InsightResult[]> {
		try {
			// validate query body & initiate necessary variables
			pq.queryValidator(query);
			let knownQuery = query as any;
			let ifCondition: string = "return " + pq.bodyHelper(knownQuery["WHERE"]);
			let queryMatches = new Function("section", ifCondition);
			let idString: string = pq.getID(knownQuery["WHERE"]);

			// validate options and columns & initiate necessary variables
			pq.optionsValidator(knownQuery["OPTIONS"]);
			pq.columnsValidator(knownQuery["OPTIONS"]["COLUMNS"], idString);
			let parsedJSON = await pq.getSections(idString);
			let passedList: InsightResult[] = [];

			// for each section, if it matches query, create InsightResult and add to list
			for (let section of parsedJSON.sectionList) {
				if (queryMatches(section)) {
					let passedSection: InsightResult = {};
					for (let col of knownQuery["OPTIONS"]["COLUMNS"]) {
						let field = col.split("_")[1];
						passedSection[col] = section[field];
					}
					passedList.push(passedSection);
				}

				if (passedList.length > 5000) {
					return Promise.reject(new ResultTooLargeError());
				}
			}

			// sort query results
			let orderColumn = knownQuery["OPTIONS"]["ORDER"];
			if (pq.orderValidator(orderColumn, idString)) {
				let field = knownQuery["OPTIONS"]["ORDER"].split("_")[1];

				if (["avg", "pass", "fail", "audit", "year"].includes(field)) {
					passedList.sort((a: any, b: any) => a[orderColumn] - b[orderColumn]);
				} else if (["dept", "id", "instructor", "title", "uuid"].includes(field)) {
					passedList.sort((a: any, b: any) => a[orderColumn].localeCompare(b[orderColumn]));
				} else {
					return Promise.reject(new InsightError());
				}
			}
			return Promise.resolve(passedList);
		} catch (error) {
			return Promise.reject(new InsightError());
		}
	}
}
