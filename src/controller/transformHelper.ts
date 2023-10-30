import {InsightDataset, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import * as fs from "fs-extra";
import InsightFacade from "./InsightFacade";
import Decimal from "decimal.js";

export function groupHelper(filteredJSON: any, knownQueryTransformationsGroup: any): any {
	let listColumns: string[] = [];
	for (let col of knownQueryTransformationsGroup) {
		let field = col.split("_")[1];
		listColumns.push(field);
	}

	let groupedJSON = filteredJSON.reduce((accumulator: any, element: any) => {
		let key: string = "";

		for (let col of listColumns) {
			key += element[col];
		}

		accumulator[key] = (accumulator[key] || []).concat(element);
		return accumulator;
	}, {});

	// console.log(groupedJSON);
	// console.log(listColumns);

	return groupedJSON;
}

export function applyHelper(group: any, knownQueryTransformationsApply: any): any {
	let appliedJSONGroup: any = {};
	let observedRules: any = new Set();


	for (let applyRule of knownQueryTransformationsApply) {
		if (observedRules.has(Object.keys(applyRule)[0])) {
			throw new InsightError();
		} else {
			observedRules.add(Object.keys(applyRule)[0]);
		}

		for (let applyKey in applyRule) {
			let groupedValue: any;
			for (let applyToken in applyRule[applyKey]) {
				let field = applyRule[applyKey][applyToken].split("_")[1];
				switch (applyToken) {
					case "MAX":
						groupedValue = max(group, field);
						break;
					case "MIN":
						groupedValue = min(group, field);
						break;
					case "AVG":
						groupedValue = avg(group, field);
						break;
					case "COUNT":
						// groupedValue = group.length;
						groupedValue = count(group, field);
						break;
					case "SUM":
						groupedValue = sum(group, field);
						break;
					default:
						throw new InsightError();
				}
			}

			appliedJSONGroup[applyKey] = groupedValue;
		}
	}

	return appliedJSONGroup;
}

function avg(group: any, field: any): number {
	let total: Decimal = group.reduce((acc: any, element: any) => {
		if (typeof element[field] !== "number") {
			throw new InsightError();
		}
		let dec = new Decimal(element[field]);
		return acc.add(dec);
	}, new Decimal(0));
	let average = total.toNumber() / group.length;
	return Number(average.toFixed(2));
}

function max(group: any, field: any): number {
	return group.reduce((maxValue: any, element: any) => {
		if (typeof element[field] !== "number") {
			throw new InsightError();
		}
		return element[field] > maxValue ? element[field] : maxValue;
	}, group[0][field]);
}

function min(group: any, field: any): number {
	return group.reduce((minValue: any, element: any) => {
		if (typeof element[field] !== "number") {
			throw new InsightError();
		}
		return element[field] < minValue ? element[field] : minValue;
	}, group[0][field]);
}

function sum(group: any, field: any): number {
	let s: number = group.reduce((acc: any, element: any) => {
		if (typeof element[field] !== "number") {
			throw new InsightError();
		}
		return acc + element[field];
	}, 0);
	return Math.round(s * 100) / 100;
}

function count(group: any, field: any): number {
	let countDict = group.reduce((dict: any, element: any) => {
		let value = element[field];
		dict[value] = (dict[value] || 0) + 1;
		return dict;
	}, {});
	return Object.keys(countDict).length;
}
