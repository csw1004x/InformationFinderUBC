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
import {RoomsList} from "../classes/RoomsList";
import {Building} from "../classes/Building";
import {BuildingList} from "../classes/BuildingList";
import {Rooms} from "../classes/Rooms";
import {parse} from "parse5";
import {findTable, findTBody, geoHelper, geoLocator, helper} from "./roomsHelper";
import {syncBuiltinESMExports} from "module";
import {updateID} from "./datasetHelper";


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
		this.allID = await updateID();
		if (!ds.isIDKindValid(id, kind)) {
			return Promise.reject(new InsightError());
		}

		// check if id is already in allID
		if (this.allID.includes(id)) {
			return Promise.reject(new InsightError());
		}

		try{
			if (kind === InsightDatasetKind.Sections) {
				return this.addDatasetSection(id, content, kind);
			}
			if (kind === InsightDatasetKind.Rooms) {
				return this.addDatasetRooms(id, content, kind);
			}
		} catch (error) {
			return Promise.reject(new InsightError());
		}
		return this.allID;
	}

	public async changeData(dataId: string, uuid: string, id: string, title: string, professor: string, subject: string,
		year: number, avg: number, pass: number, fail: number, audit: number): Promise<string> {

		const filename = dataId + ".json";
		const filePath = "./data/" + filename;
		let data: any;
		try {
			const fileContents = await fs.readFile(filePath, "utf8");
			data = JSON.parse(fileContents);
		} catch (error) {
			return Promise.reject(new InsightError());
		}

		for (let tmp of data.sectionList){
			if (tmp.uuid === uuid) {
				return Promise.reject(new InsightError());
			}
		}

		let section: any = {};
		section["uuid"] = uuid;
		section["id"] = id;
		section["title"] = title;
		section["instructor"] = professor;
		section["dept"] = subject;
		section["year"] = year;
		section["avg"] = avg;
		section["pass"] = pass;
		section["fail"] = fail;
		section["audit"] = audit;
		data.sectionList.push(section);

		await this.removeDataset(dataId);
		// write the data to the disk
		await ds.writeDataToDisk(data, dataId);

		return dataId;
	}

	public async addDatasetRooms(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			let buildingList: BuildingList = new BuildingList();
			const zip = new JSZip();
			let tmp = await zip.loadAsync(content, {base64: true});

			const dataList = new RoomsList(id, kind);

			const indexFile = await tmp.files["index.htm"].async("string");

			if (!indexFile) {
				return Promise.reject(new InsightError());
			}

			const document = parse(indexFile);

			if (!findTable(document)) {
				return Promise.reject(new InsightError());
			}

			findTBody(document, buildingList);

			await geoHelper(buildingList);

			const folder = zip.folder("campus/discover/buildings-and-classrooms");
			// console.log(folder);
			if (!folder) {
				return Promise.reject(new InsightError());
			}

			// go through each file in the folder
			const files = folder.file(/.+/); // regex to match any file name
			await helper(files, buildingList, dataList);

			if (dataList.getNumberOfSections() === 0) {
				return Promise.reject(new InsightError());
			}

			await ds.writeDataToDisk(dataList, id);
			this.allID = await updateID();
		} catch (error) {
			return Promise.reject(new InsightError());
		}
		return this.allID;
	}

	public async addDatasetSection(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			const dataList = new SectionsList(id, kind);

			const zip = new JSZip();
			await zip.loadAsync(content, {base64: true});
			const coursesFolder = zip.folder("courses");

			// Check if there is a courses folder
			if (!coursesFolder) {
				return Promise.reject(new InsightError());
			}

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
			// print allId
			// console.log(this.allID);
			await ds.writeDataToDisk(dataList, id);
			this.allID = await updateID();
		} catch (err) {
			return Promise.reject(new InsightError());
		}
		return this.allID; // stub
	}

	public async removeDataset(id: string): Promise<string> {
		this.allID = await updateID();
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
		await fs.remove(filePath).then().catch();

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
				// find the kind
				let kind = InsightDatasetKind.Sections;

				let numRows = 0;

				try {
					const filePath = `${dataDir}/${file}`;
					const fileContents = await fs.readFile(filePath, "utf8");
					const jsonData = JSON.parse(fileContents);

					const tmp = jsonData["kind"];
					if (tmp === "rooms") {
						kind = InsightDatasetKind.Rooms;
					}

					if (jsonData && jsonData.sectionList && Array.isArray(jsonData.sectionList)) {
						numRows = jsonData.sectionList.length;
					}

					if (jsonData && jsonData.roomsList && Array.isArray(jsonData.roomsList)) {
						numRows = jsonData.roomsList.length;
					}
				} catch (error) {
					// Handle errors here, or skip as needed
				}
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
			pq.queryValidator(query);
			let knownQuery = query as any;
			let idString: string = pq.getID(knownQuery);
			let parsedJSON = await pq.getJSON(idString);
			let whereFilteredJSON = pq.filterWhere(parsedJSON, knownQuery);
			let transformedJSON = pq.transform(whereFilteredJSON, knownQuery["TRANSFORMATIONS"]);
			let passedList = pq.filterOptions(transformedJSON, knownQuery, idString);
			let sortedList = pq.sortQuery(passedList, knownQuery);
			return Promise.resolve(sortedList);
		} catch (error) {
			if (error instanceof ResultTooLargeError) {
				return Promise.reject(new ResultTooLargeError());
			} else {
				return Promise.reject(new InsightError());
			}
		}
	}
}

