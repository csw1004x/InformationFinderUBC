// import * as fs from "fs";
import * as fs from "fs-extra";
import {expect} from "chai";

import * as pq from "../../src/controller/performQueryHelper";
import {InsightDataset, InsightDatasetKind, InsightResult} from "../../src/controller/IInsightFacade";

function readQuery(filename: string): any {
	let fileContent = fs.readFileSync("test/methods/queries/" + filename);
	let parsedJSON = JSON.parse(fileContent.toString());
	return parsedJSON.input;
}

describe("Tests for performQueryHelper", () => {
	let noOptionsQuery: unknown;
	let noWhereQuery: unknown;
	let simpleQuery: unknown;
	let complexQuery: unknown;
	let complexMcompQuery: unknown;
	let simpleScompQuery: unknown;
	let complexScompQuery: unknown;
	let sampleDatasets: InsightDataset[];


	before(() => {
		noOptionsQuery = readQuery("missingOptions.json");
		noWhereQuery = readQuery("missingWhere.json");
		simpleQuery = readQuery("simple.json");
		complexQuery = readQuery("complex.json");
		complexMcompQuery = readQuery("complex_mcomp.json");
		simpleScompQuery = readQuery("simple_scomp.json");
		complexScompQuery = readQuery("complex_scomp.json");

		sampleDatasets = [
			{id: "id1", kind: InsightDatasetKind.Sections, numRows: 1},
			{id: "id2", kind: InsightDatasetKind.Sections, numRows: 2}
		];

	});

	describe("Query Input Object Type Exploration", () => {
		it("should contain specific object attributes", () => {
			let queryInput = readQuery("complex.json");

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

		it("should confirm inner objects", () => {
			console.log(simpleQuery);
			let queryObject = simpleQuery as any; // cast as "any" to access attributes
			console.log(Object.keys(queryObject));
			console.log(queryObject[Object.keys(queryObject)[0]]);
		});
	});

	describe("Basic Checks for Parsing", () => {
		it("eval for parsing", () => {
			let one = 1;
			let s = "return (x < 2)";
			let customFunction = new Function("x",s);
			if (customFunction(one)) {
				console.log("it worked!");
			} else {
				console.log("fail...");
			}

		});

		it("unit test: mComparator", () => {
			let queryObject = simpleQuery as any;
			queryObject = queryObject["WHERE"];
			let key = Object.keys(queryObject)[0];
			console.log(queryObject);
			console.log(queryObject[key]);

			let s = pq.mComparatorHelper(queryObject[key], key);
			expect(s).to.eql("(avg > 97)");
		});

		it("integration test: BODY + mComparator", () => {
			let queryObject = simpleQuery as any;
			let s = pq.bodyHelper(queryObject["WHERE"]);
			expect(s).to.eql("(avg > 97)");
		});

		it("integration test: LOGIC + BODY + mComparator", () => {
			let queryObject = complexMcompQuery as any;
			let s = pq.bodyHelper(queryObject["WHERE"]);
			expect(s).to.eql("(((avg > 90) && (avg < 99)) || (avg === 95))");
		});

		it("unit test: sComparator", () => {
			let queryObject = simpleScompQuery as any;
			queryObject = queryObject["WHERE"];
			let key = Object.keys(queryObject)[0];
			console.log(queryObject);
			console.log(queryObject[key]);

			let s = pq.sComparatorHelper(queryObject[key], key);
			console.log(s);
			expect(s).to.eql("(dept === \"adhe\")");
		});

		it("integration test: LOGIC + BODY + sComparator", () => {
			let queryObject = complexScompQuery as any;
			let s = pq.bodyHelper(queryObject["WHERE"]);
			console.log(s);
			expect(s).to.eql(String.raw`(((id === "123") && (instructor === "bam")) || (dept === "adhe")` +
			String.raw` || (dept.endsWith("sci")) || (dept.startsWith("dsc")) || (dept.includes("dh")))`);
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
			expect(pq.isValidQuery(simpleQuery, sampleDatasets)).to.eql(true);
		});
	});
})
;
