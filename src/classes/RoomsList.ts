import {Sections} from "./Sections";
import {InsightDatasetKind} from "../controller/IInsightFacade";
import {Rooms} from "./Rooms";

export class RoomsList {
	private roomsList: Rooms[];
	private id: string;
	private kind: InsightDatasetKind;

	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;

		// make it empty for now? not sure if I want to have constructor have
		// an argument to put everything or we make a function
		// to add the data within the adddataset function thats public to access... wip for now
		this.roomsList = [];
	}

	public get getID() {
		return this.id;
	}

	public get getKind() {
		return this.kind;
	}

	public get getSectionList() {
		return this.roomsList;
	}

	// A function that adds a section to the sectionList
	public addSection(rooms: Rooms): void {
		this.roomsList.push(rooms);
	}

	// A function that returns the number of sections in the sectionList
	public getNumberOfSections(): number {
		return this.roomsList.length;
	}

	// Write a function where it prints all the sections in the sectionList using printAllFields()
	// using for of loop
	public printAllSections(): void {
		for (const rooms of this.roomsList) {
			rooms.printALlFields();
		}
	}
}
