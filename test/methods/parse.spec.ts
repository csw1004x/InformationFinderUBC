// import * as fs from "fs";
import * as fs from "fs-extra";
import {expect} from "chai";

import * as pq from "../../src/controller/performQueryHelper";
import * as bd from "../../src/controller/bodyHelper";
import InsightFacade from "../../src/controller/InsightFacade";
import {InsightError} from "../../src/controller/IInsightFacade";

function readQuery(filename: string): any {
	let fileContent = fs.readFileSync("test/methods/queries/" + filename);
	let parsedJSON = JSON.parse(fileContent.toString());
	return parsedJSON.input;
}

describe("Tests for performQueryHelper", () => {
	let noOptionsQuery: unknown;
	let noWhereQuery: unknown;
	let emptyWhereQuery: unknown;
	let simpleQuery: unknown;
	let complexQuery: unknown;
	let complexMcompQuery: unknown;
	let simpleScompQuery: unknown;
	let complexScompQuery: unknown;

	before(() => {
		noOptionsQuery = readQuery("missingOptions.json");
		noWhereQuery = readQuery("missingWhere.json");
		emptyWhereQuery = readQuery("emptyWhere.json");
		simpleQuery = readQuery("simple.json");
		complexQuery = readQuery("complex.json");
		complexMcompQuery = readQuery("complex_mcomp.json");
		simpleScompQuery = readQuery("simple_scomp.json");
		complexScompQuery = readQuery("complex_scomp.json");
	});

	describe("getAttributes tests", () => {
		it("simpleQuery", () => {
			let queryObject = simpleQuery as any;
			console.log(queryObject["OPTIONS"]["COLUMNS"]);
			console.log(queryObject["OPTIONS"]["COLUMNSX"] === undefined);
		});
	});

	describe("getID tests", () => {
		it("simpleQuery", () => {
			let queryObject = simpleQuery as any;
			console.log(pq.getID(queryObject["WHERE"]));
		});
		it("complexQuery", () => {
			let queryObject = complexQuery as any;
			console.log(pq.getID(queryObject["WHERE"]));
		});
	});

	describe("Query Input Object Type Exploration", () => {
		it("should contain specific object attributes", () => {
			let queryInput = readQuery("complex.json");

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
			// let x = 1;
			// eval(String.raw`console.log(x < 2)`);

			let one = {x: 1, y: "str"};
			let s = String.raw`return (i.x < 2 && i.y === "str")`;
			let customFunction = new Function("i", s);
			if (customFunction(one)) {
				console.log(one);
				console.log(one.x);
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

			let s = bd.mComparatorHelper(queryObject[key], key);
			expect(s).to.eql("(section.avg > 97)");
		});

		it("integration test: BODY + mComparator", () => {
			let queryObject = simpleQuery as any;
			let s = bd.bodyHelper(queryObject["WHERE"]);
			expect(s).to.eql("(section.avg > 97)");
		});

		it("integration test: LOGIC + BODY + mComparator", () => {
			let queryObject = complexMcompQuery as any;
			let s = bd.bodyHelper(queryObject["WHERE"]);
			expect(s).to.eql("(((section.avg > 90) && (section.avg < 99)) || (section.avg === 95))");
		});

		it("unit test: sComparator", () => {
			let queryObject = simpleScompQuery as any;
			queryObject = queryObject["WHERE"];
			let key = Object.keys(queryObject)[0];
			console.log(queryObject);
			console.log(queryObject[key]);

			let s = bd.sComparatorHelper(queryObject[key], key);
			console.log(s);
			expect(s).to.eql('(section.dept === "adhe")');
		});

		it("integration test: LOGIC + BODY + sComparator", () => {
			let queryObject = complexScompQuery as any;
			let s = bd.bodyHelper(queryObject["WHERE"]);
			console.log(s);
			expect(s).to.eql(
				String.raw`(((section.id === "123") && (section.instructor === "bam")) || ` +
				String.raw`(section.dept === "adhe") || (section.dept.endsWith("sci")) || ` +
				String.raw`(section.dept.startsWith("dsc")) || (section.dept.includes("dh")))`
			);
		});
	});

	describe("empty where", () => {
		it("empty where should return empty string", () => {// let queryObject = emptyWhereQuery as any;
			// let queryObject = complexScompQuery as any;
			let queryObject = emptyWhereQuery as any;
			console.log(queryObject["WHERE"]);
			expect(queryObject["WHERE"]).to.eql({});
			expect(JSON.stringify(queryObject["WHERE"])).to.eql("{}");
			let s = bd.bodyHelper(queryObject["WHERE"]);
			expect(s).to.eql("");
		});

		it("", () => {// let queryObject = emptyWhereQuery as any;
			// let queryObject = complexScompQuery as any;
			let queryObject = emptyWhereQuery as any;
			let s = bd.bodyHelper(queryObject["WHERE"]);
			expect(s).to.eql("");
			console.log(queryObject["NOTHERE"]);
		});


	});

	describe("transformation", async () => {
		it("grouping", async () => {
			let facade = new InsightFacade();
			let datas = await facade.listDatasets();
			let parsedJSON = await pq.getSections("sections");
			let filteredJSON = pq.filterWhere(parsedJSON, emptyWhereQuery);

			let groupedJSON = filteredJSON.reduce((accumulator: any, element: any) => {
				let key = element["title"]; // + "_" + element.instructor;
				accumulator[key] = (accumulator[key] || []).concat(element);
				return accumulator;
			}, {});

			let result: {[key: string]: any} = {};

			for (let key in groupedJSON) {
				let group = groupedJSON[key];
				let sum = group.reduce((acc: any, element: any) => {
					return acc + element["avg"];
				}, 0);
				let avg = sum / group.length;
				result[key] = {avg};
			}
			console.log(result);
		});

	});
});

// describe("performQueryHelper", () => {
// 	it("should reject for empty, or incomplete queries", () => {
// 		expect(pq.queryValidator("")).to.eql(false);
// 		expect(pq.queryValidator(null)).to.eql(false);
// 		expect(pq.queryValidator(undefined)).to.eql(false);
// 		expect(pq.queryValidator(0)).to.eql(false);
// 		expect(pq.queryValidator(noOptionsQuery)).to.eql(false);
// 		expect(pq.queryValidator(noWhereQuery)).to.eql(false);
// 		expect(pq.queryValidator(simpleQuery)).to.eql(true);
// 	});
// });

// describe("Integration tests", () => {
// 	before(() => {
// 		// void
// 	});
//
// 	it("read from ./data", async () => {
// 		let dataDir = "data/";
// 		let facade = new InsightFacade();
// 		let datas = await facade.listDatasets();
// 		for (let data of datas) {
// 			let filePath = dataDir + data.id + ".json";
// 			let fileContent = fs.readFileSync(filePath);
// 			let parsedJSON = JSON.parse(fileContent.toString());
//
// 			for (let s of parsedJSON.sectionList) {
// 				console.log(s);
// 			}
// 		}
// 	});
// });

// describe("InsightFacade.performQuery tests", () => {
// 	let facade: InsightFacade;
// 	let simpleQuery: unknown;
// 	let complexQuery: unknown;
//
// 	before(() => {
// 		facade = new InsightFacade();
// 		simpleQuery = readQuery("simple.json");
// 		complexQuery = readQuery("complex.json");
// 	});
//
// 	it("performQuery's query function - simple", async () => {
// 		let IR = await facade.performQuery(simpleQuery);
// 		console.log(IR);
// 	});
//
// 	it("performQuery's query function - complex", async () => {
// 		let IR = await facade.performQuery(complexQuery);
// 		console.log(IR);
// 	});
// });
