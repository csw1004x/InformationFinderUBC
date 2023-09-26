// import * as fs from "fs";
import * as fs from "fs-extra";
import {expect} from "chai";

import * as pq from "../../src/controller/performQueryHelper";
import {InsightDataset, InsightDatasetKind, InsightResult} from "../../src/controller/IInsightFacade";

describe("Tests for performQueryHelper", () => {
	let noOptionsQuery: unknown;
	let noWhereQuery: unknown;
	let validQuery: unknown;
	let sampleDatasets: InsightDataset[];

	before(() => {
		noOptionsQuery = {WHERE: {GT: {sections_avg: 97}}};
		noWhereQuery = {OPTIONS: {COLUMNS: ["sections_dept", "sections_id", "sections_avg"], ORDER: "sections_avg"}};
		validQuery = {
			WHERE: {GT: {sections_avg: 97}},
			OPTIONS: {COLUMNS: ["sections_avg", "sections_avg"], ORDER: "sections_avg"}
		};
		sampleDatasets = [
			{id: "id1", kind: InsightDatasetKind.Sections, numRows: 1},
			{id: "id2", kind: InsightDatasetKind.Sections, numRows: 2}
		];

	});

	describe("Basic Checks for Parsing", () => {
		it("should read into string", () => {
			let filename = "complex.json";
			let fileContent = fs.readFileSync("test/methods/" + filename);

			let returned = JSON.parse(fileContent.toString());
			let queryInput = returned.input;

			// below logs are just for debugging
			// console.log(queryInput);
			// console.log(typeof queryInput);
			// console.log("WHERE" in queryInput);
			// console.log("OPTIONS" in queryInput);

			// tests below for types
			expect(queryInput).to.be.an("object");
			expect(queryInput.WHERER).to.be.eq(undefined);
			expect(queryInput.WHERE).to.be.not.eq(undefined);
			expect(queryInput.OPTIONS).to.be.not.eq(undefined);
		});
	});

	describe("performQueryHelper", () => {
		it("should reject for empty, or incomplete queries", () => {
			expect(pq.isValidQuery("", sampleDatasets)).to.eql(false);
			expect(pq.isValidQuery(null, sampleDatasets)).to.eql(false);
			expect(pq.isValidQuery(undefined, sampleDatasets)).to.eql(false);
			expect(pq.isValidQuery(0, sampleDatasets)).to.eql(false);
			expect(pq.isValidQuery(noOptionsQuery, sampleDatasets)).to.eql(false);
			expect(pq.isValidQuery(noWhereQuery, sampleDatasets)).to.eql(false);
			expect(pq.isValidQuery(validQuery, sampleDatasets)).to.eql(true);
		});
	});
});
