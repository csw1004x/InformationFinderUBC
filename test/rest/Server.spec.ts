import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let PORT: number;
	let server: Server;
	let SERVER_URL: string;
	let ENDPOINT_URL: string;
	let ZIP_FILE_DATA: string;

	before(function (done) {
		facade = new InsightFacade();
		PORT = 4321;
		server = new Server(4321);

		// TODO: start server here once and handle errors properly
		server.start().then(() => {
			SERVER_URL = `http://localhost:${PORT}`;
			console.log(SERVER_URL);
			done();
		}).catch((err) => {
			console.log(err);
			done();
		});
	});

	after(function () {
		// TODO: stop server here once!
		server.stop().then(() => {
			console.log("Server stopped");
		}).catch((err) => {
			console.error("Error stopping server:", err);
		});
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	// Sample on how to format PUT requests
	// it("PUT test for courses dataset", () => {
	// 	ENDPOINT_URL = "";
	// 	try {
	// 		return request(SERVER_URL)
	// 			.put(ENDPOINT_URL)
	//             // .send(ZIP_FILE_DATA)
	// 			.set("Content-Type", "application/x-zip-compressed")
	// 			.then(function (res: Response) {
	//                 // some logging here please!
	// 				expect(res.status).to.be.equal(200);
	// 			})
	// 			.catch(function (err) {
	//                 // some logging here please!
	// 				expect.fail();
	// 			});
	// 	} catch (err) {
	//         // and some more logging here!
	// 	}
	// });

	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
	it("should return a JSON object with status code 200", () => {
		ENDPOINT_URL = "/dataset";
		try {
			return request(SERVER_URL)
				.get(ENDPOINT_URL)
				.then((res: request.Response) => {
					expect(res.status).to.be.equal(200);
				}).catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("should return results for a valid query", () => {
		const sampleQuery = {
			WHERE: {
				IS: {
					sections_dept: "cpsc"
				}
			},
			OPTIONS: {
				COLUMNS: [
					"sectionAvg",
					"sections_dept",
					"sections_id"
				]
			},
			TRANSFORMATIONS: {
				GROUP: [
					"sections_dept",
					"sections_id"
				],
				APPLY: [
					{
						sectionAvg: {
							AVG: "sections_avg"
						}
					}
				]
			}
		};

		ENDPOINT_URL = "/query";
		try {
			return request(SERVER_URL)
				.post(ENDPOINT_URL)
				.send(sampleQuery)
				.set("Content-Type", "application/json")
				.then((res: request.Response) => {
					// console.log("Sample Query:", sampleQuery);
					// console.log("Response Body:", res.body);
					expect(res.status).to.be.equal(200);
				}).catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("should fail for invalid query", () => {
		const sampleQuery = {
			WHERE: {
				IS: {
					sections_X: "cpsc"
				}
			},
			OPTIONS: {
				COLUMNS: [
					"sectionAvg",
					"sections_dept",
					"sections_id"
				]
			},
			TRANSFORMATIONS: {
				GROUP: [
					"sections_dept",
					"sections_id"
				],
				APPLY: [
					{
						sectionAvg: {
							AVG: "sections_avg"
						}
					}
				]
			}
		};

		ENDPOINT_URL = "/query";

		return request(SERVER_URL)
			.post(ENDPOINT_URL)
			.send(sampleQuery)
			.set("Content-Type", "application/json")
			.then((res: request.Response) => {
				console.log("Sample Query:", sampleQuery);
				console.log("Response Body:", res.body);
				expect(res.status).to.be.equal(400);
			}).catch(function (err) {
				console.log(err);
				expect.fail();
			});

	});
});
