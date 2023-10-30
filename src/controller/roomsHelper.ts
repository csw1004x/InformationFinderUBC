// This function has contents of the individual html files within the nested folders
import {Building} from "../classes/Building";
import {RoomsList} from "../classes/RoomsList";
import {Rooms} from "../classes/Rooms";
import {BuildingList} from "../classes/BuildingList";
import JSZip from "jszip";

export function getRoom(document: any, building: Building, dataList: RoomsList){
	for (let child in document.childNodes) {
		if (document.childNodes[child].nodeName === "tbody") {
			findTRRoom(document.childNodes[child], building, dataList);
		} else {
			getRoom(document.childNodes[child], building, dataList);
		}
	}
}

// Are each rooms in a building
export function findTRRoom(document: any, building: Building, dataList: RoomsList){
	for (let child in document.childNodes) {
		if (document.childNodes[child].nodeName === "tr") {
			let room = new Rooms();
			findTDRoom(document.childNodes[child], room);
			room.setAddress(building.getAddress());
			room.setFullName(building.getFullName());
			room.setShortName(building.getShortName());
			room.setHref(building.getHref());
			room.setLat(building.getLat());
			room.setLon(building.getLon());
			room.setName(room.getShortName() + "_" + room.getNumber());
			if ( room.getCounter() === 11){
				dataList.addSection(room);
			}
		} else {
			findTRRoom(document.childNodes[child], building, dataList);
		}
	}
}

export function findTDRoom(document: any, room: Rooms){
	for (let child in document.childNodes) {
		if (document.childNodes[child].nodeName === "td") {
			let tmp: any;
			if (document.childNodes[child].attrs[0].value === "views-field views-field-field-room-number") {
				tmp = document.childNodes[child].childNodes[1].childNodes[0].value;
				room.setNumber(tmp);
			}

			if (document.childNodes[child].attrs[0].value === "views-field views-field-field-room-capacity") {
				tmp = document.childNodes[child].childNodes[0].value.trim();
				room.setSeats(tmp);
			}

			if (document.childNodes[child].attrs[0].value === "views-field views-field-field-room-furniture") {
				tmp = document.childNodes[child].childNodes[0].value.trim();
				room.setFurniture(tmp);
			}

			if (document.childNodes[child].attrs[0].value === "views-field views-field-field-room-type") {
				tmp = document.childNodes[child].childNodes[0].value.trim();
				room.setType(tmp);
			}

		} else {
			findTDRoom(document.childNodes[child], room);
		}
	}
}

// Find the table within a html file the table within the tbody without using library.
// If found, call the function to find the tr and td
export function findTBody(document: any, buildingList: BuildingList): void {
	for (let child in document.childNodes) {
		if (document.childNodes[child].nodeName === "tbody") {
			findTR(document.childNodes[child], buildingList);
		} else {
			findTBody(document.childNodes[child], buildingList);
		}
	}
}

// Iterate and print all the tr and td
export function findTR(document: any, buildingList: BuildingList): void {
	for (let child in document.childNodes) {
		if (document.childNodes[child].nodeName === "tr") {
			let building = new Building();
			findTD(document.childNodes[child], building);
			buildingList.pushBuilding(building);
		} else {
			findTR(document.childNodes[child], buildingList);
		}
	}
}

// write a function that finds the td and prints out the class names of each td using .attrs
export function findTD(document: any, building: Building): void {
	for (let child in document.childNodes) {
		if (document.childNodes[child].nodeName === "td") {
			let tmp: string;
			if (document.childNodes[child].attrs[0].value === "views-field views-field-field-building-code") {
				tmp = document.childNodes[child].childNodes[0].value.trim();
				building.setShortName(tmp);
			}

			if (document.childNodes[child].attrs[0].value === "views-field views-field-field-building-address") {
				tmp = document.childNodes[child].childNodes[0].value.trim();
				building.setAddress(tmp);
			}

			if (document.childNodes[child].attrs[0].value === "views-field views-field-title") {
				building.setFullName(document.childNodes[child].childNodes[1].childNodes[0].value);
			}

			// get the value of href which is the link to the building
			if (document.childNodes[child].attrs[0].value === "views-field views-field-nothing") {
				tmp = document.childNodes[child].childNodes[1].attrs[0].value;
				building.setHref(tmp);
			}
		} else {
			findTD(document.childNodes[child], building);
		}
	}
}

export async function helper(files: JSZip.JSZipObject[], parser: any, buildingList: BuildingList, dataList: RoomsList) {
	// Use Promise.all to process all files in parallel and store the results in an array
	const fileContentsPromises = files.map(async (file) => {
		try {
			const fileContent = await file.async("string");
			const folderFile = parser.parse(fileContent);

			for (let building of buildingList.getBuildingList()) {
				if (building.getHref() === "./" + file.name) {
					getRoom(folderFile, building, dataList);
				}
			}
		} catch (err) {
			// skip
		}
	});

	await Promise.all(fileContentsPromises);
}
