import {Request, Response} from "express";
import {InsightDataset, InsightError, InsightResult, NotFoundError} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

const facade: InsightFacade = new InsightFacade();

// /echo/:msg
export function echo(req: Request, res: Response): void {
	try {
		console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
		const response = performEcho(req.params.msg);
		res.status(200).json({result: response});
	} catch (err) {
		res.status(400).json({error: err});
	}
}

export function performEcho(msg: string): string {
	if (typeof msg !== "undefined" && msg !== null) {
		return `${msg}...${msg}`;
	} else {
		return "Message not provided";
	}
}

// /dataset/:id/:kind
export async function putDataset(req: Request<any>, res: Response): Promise<void> {
	let params = req.params;
	let rawZip = req.body;

	facade.addDataset(params.id, rawZip.toString("base64"), params.kind)
		.then((arr: string[]) => {
			res.status(200).json({result: arr});
		})
		.catch((err: Error) => {
			res.status(400).json({error: err.message});
		});
}

// /dataset/:id
export async function deleteDataset(req: Request<any>, res: Response): Promise<void> {
	facade.removeDataset(req.params.id)
		.then((str: string) => {
			res.status(200).json({result: str});
		})
		.catch((err: InsightError) => {
			res.status(400).json({error: err.message});
		})
		.catch((err: NotFoundError) => {
			res.status(404).json({error: err.message});
		})
		.catch((err: Error) => {
			res.status(408).json({error: err.message});
		});
}

// /query
export async function queryDataset(req: Request<any>, res: Response): Promise<void> {
	let query = req.body;
	// console.log("Query Received: ", query);

	facade.performQuery(query)
		.then((arr: InsightResult[]) => {
			res.status(200).json({result: arr});
		})
		.catch((err: Error) => {
			res.status(400).json({error: err.message});
		});
}

// /dataset
export async function getDataset(req: Request<any>, res: Response): Promise<void> {
	facade.listDatasets()
		.then((arr: InsightDataset[]) => {
			res.status(200).json({result: arr});
		});
}
export async function updateSection(req: Request<any>, res: Response): Promise<void> {
	let params = req.params;

	facade.changeData(params.dataid, params.uuid, params.id, params.title, params.instructor, params.dept,
		params.year, params.avg, params.pass, params.fail, params.audit)
		.then((str: string) => {
			res.status(200).json({result: str});
		})
		.catch((err: InsightError) => {
			res.status(400).json({error: err.message});
		});
}
