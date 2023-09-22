import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
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
	let sectionsNotCourse: string;

	let facade: InsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		sections1 = getContentFromArchives("courses_1.zip");
		sections2 = getContentFromArchives("courses_2.zip");
		sectionsNotCourse = getContentFromArchives("not_courses.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		it ("should reject with  an empty dataset id", function() {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Fulfill: Add dataset successfully once", async function () {
			const id = "section1";
			const result = await facade.addDataset(id, sections, InsightDatasetKind.Sections);
			expect(result).to.be.an("array");
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal(id);

			let list = await facade.listDatasets();
			expect(list.length).to.equal(1);
			expect(list[0].id).to.equal(id);
			expect(list[0].kind).to.equal(InsightDatasetKind.Sections);
			expect(list[0].numRows).to.equal(64612);
		});

		it("Fulfill: Add dataset successfully multiple", async function () {
			const id1 = "section1";
			const id2 = "section2";

			let result;
			result = await facade.addDataset(id1, sections1, InsightDatasetKind.Sections);
			result = await facade.addDataset(id2, sections2, InsightDatasetKind.Sections);

			expect(result).to.be.an("array");
			expect(result.length).to.equal(2);

			expect(result).to.include(id1);
			expect(result).to.include(id2);
		});

		it("Fulfill: Handling Crashes", async function () {
			const id = "section1";
			const result = await facade.addDataset(id, sections, InsightDatasetKind.Sections);

			let newInstance = new InsightFacade();

			let list = await newInstance.listDatasets();
			expect(list.length).to.equal(1);
			expect(list[0].id).to.equal(id);
			expect(list[0].kind).to.equal(InsightDatasetKind.Sections);
			expect(list[0].numRows).to.equal(64612);
		});

		it("Reject: Folder not courses", async function () {
			const id = "section1";
			const result = await facade.addDataset(id, sectionsNotCourse, InsightDatasetKind.Sections);
			expect(result).to.be.an("array");
			expect(result.length).to.equal(0);
		});

		it("Reject: Add empty dataset id", async function () {
			const result: Promise<string[]> = facade.addDataset("", sections1, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add underscore id (front)", async function () {
			const result: Promise<string[]> = facade.addDataset("_invalidid", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add underscore id (mid)", async function () {
			const result: Promise<string[]> = facade.addDataset("invalid_id", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add underscore id (back)", async function () {
			const result: Promise<string[]> = facade.addDataset("invalidid_", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add whitespace id (space)", async function () {
			const result: Promise<string[]> = facade.addDataset(" ", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add whitespace id (tab)", async function () {
			const result: Promise<string[]> = facade.addDataset("\t", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add whitespace id (linefeed)", async function () {
			const result: Promise<string[]> = facade.addDataset("\n", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add whitespace id (carriage return)", async function () {
			const result: Promise<string[]> = facade.addDataset("\r", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add whitespace id (form feed)", async function () {
			const result: Promise<string[]> = facade.addDataset("\f", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add whitespace id (vertical tab)", async function () {
			const result: Promise<string[]> = facade.addDataset("\v", sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Add duplicated id", async function () {
			const id = "section1";

			// Attempt #1 to add the same dataset
			await facade.addDataset(id, sections1, InsightDatasetKind.Sections);

			// Attempt #2 to add the same dataset
			const result = facade.addDataset(id, sections1, InsightDatasetKind.Sections);
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("Fulfill: Remove dataset successfully once", async function () {
			const id = "section1";
			await facade.addDataset(id, sections1, InsightDatasetKind.Sections);

			const result = await facade.removeDataset(id);
			expect(result).to.be.a("string").that.equals(id);
		});

		it("Fulfill: Remove dataset successfully multiple", async function () {
			const id1 = "section1";
			const id2 = "section2";
			await facade.addDataset(id1, sections1, InsightDatasetKind.Sections);
			await facade.addDataset(id2, sections2, InsightDatasetKind.Sections);

			const result1 = await facade.removeDataset(id1);
			expect(result1).to.be.a("string").that.equals(id1);

			const result2 = await facade.removeDataset(id2);
			expect(result2).to.be.a("string").that.equals(id2);

			let list = await facade.listDatasets();
			expect(list.length).to.equal(0);
		});

		it("Reject: Remove non-existent id", async function () {
			const result = facade.removeDataset("section1");
			await expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("Reject: Remove empty id", async function () {
			const result = facade.removeDataset("");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove underscored id (front)", async function () {
			const result = facade.removeDataset("_invalidid");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove underscored id (mid)", async function () {
			const result = facade.removeDataset("invalid_id");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove underscored id (back)", async function () {
			const result = facade.removeDataset("invalidid_");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove only whitespace id (space)", async function () {
			const result = facade.removeDataset(" ");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove only whitespace id (tab)", async function () {
			const result = facade.removeDataset("\t");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove only whitespace id (linefeed)", async function () {
			const result = facade.removeDataset("\n");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove only whitespace id (carriage return)", async function () {
			const result = facade.removeDataset("\r");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove only whitespace id (form feed)", async function () {
			const result = facade.removeDataset("\f");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("Reject: Remove only whitespace id (vertical tab)", async function () {
			const result = facade.removeDataset("\v");
			await expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("Fulfill: list empty dataset", async function () {
			let result = await facade.listDatasets();

			const dataset1Presence = result.filter((dataset) => dataset.id === "validid");
			expect(dataset1Presence).to.have.lengthOf(0);
		});

		it("Fulfill: list single dataset", async function () {
			await facade.addDataset("id1", sections1, InsightDatasetKind.Sections);
			let result = await facade.listDatasets();

			const dataset1Presence = result.filter((dataset) => dataset.id === "id1");
			expect(dataset1Presence).to.have.lengthOf.at.least(1);
		});

		it("Fulfill: list multiple dataset", async function () {
			await facade.addDataset("id1", sections1, InsightDatasetKind.Sections);
			await facade.addDataset("id2", sections2, InsightDatasetKind.Sections);
			let result = await facade.listDatasets();

			const dataset1Presence = result.filter((dataset) => dataset.id === "id1");
			expect(dataset1Presence).to.have.lengthOf.at.least(1);

			const dataset2Presence = result.filter((dataset) => dataset.id === "id2");
			expect(dataset2Presence).to.have.lengthOf.at.least(1);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(async function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		// type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<Input, Output, Error>(
			"Dynamic InsightFacade PerformQuery tests",
			async (input) => await facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.have.deep.members(expected);
				},
				errorValidator: (error): error is Error =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);
	});
});
