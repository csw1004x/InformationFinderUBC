import {Building} from "./Building";

export class BuildingList {
	private buildingList: Building[];

	constructor() {
		this.buildingList = [];
	}

	public getBuildingList() {
		return this.buildingList;
	}

	public pushBuilding(building: Building) {
		this.buildingList.push(building);
	}

}
