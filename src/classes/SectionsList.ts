import {Sections} from "./Sections";
import {InsightDatasetKind} from "../controller/IInsightFacade";

export class SectionsList {
	private id: string;
	private sectionList: Sections[];
	private kind: InsightDatasetKind;

	constructor(id: string, kind: InsightDatasetKind){
		this.id = id;
		this.kind = kind;

		// make it empty for now? not sure if I want to have constructor have
		// an argument to put everything or we make a function
		// to add the data within the adddataset function thats public to access... wip for now
		this.sectionList = [];
	}

	public get getID(){
		return this.id;
	}

	public get getKind(){
		return this.kind;
	}

	public get getSectionList(){
		return this.sectionList;
	}

	// A function that adds a section to the sectionList
	public addSection(section: Sections): void {
		this.sectionList.push(section);
	}

	// A function that returns the number of sections in the sectionList
	public getNumberOfSections(): number {
		return this.sectionList.length;
	}

	// Write a function where it prints all the sections in the sectionList using printAllFields()
	// using for of loop
	public printAllSections(): void {
		for (const section of this.sectionList){
			section.printALlFields();
		}
	}
}
