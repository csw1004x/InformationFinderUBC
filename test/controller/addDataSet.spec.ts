import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

type Input = unknown;
type Output = InsightResult[];
type Error = "InsightError" | "ResultTooLargeError";

// tests for InsightFacade.ts
describe("InsightFacade", function () {
	// variable names to be used in tests
	let sections1: string;
	let sections2: string;
	let sections3: string;
	let sectionsNotCourse: string;

	let facade: InsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let section2: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		section2 = getContentFromArchives("campus.zip");


		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("Test zip file", async function () {
			const result: Promise<string[]> = facade.addDataset("sections", sections, InsightDatasetKind.Sections);
		});
	});


	describe("Add/Remove/List Dataset ROOMS", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("Test zip file", async function () {
			await facade.addDataset("MACE", section2, InsightDatasetKind.Rooms);
		});

	});
});
