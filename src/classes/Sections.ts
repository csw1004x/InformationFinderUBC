export class Sections {
	private sectionUUID: string;
	private sectionID: string;
	private sectionTitle: string;
	private sectionInstructor: string;
	private sectionDept: string;
	private sectionYear: number;
	private sectionAvg: number;
	private sectionPass: number;
	private sectionFail: number;
	private sectionAudit: number;

	constructor(sectionUUID: string, sectionID: string, sectionTitle: string,
		sectionInstructor: string, sectionDept: string, sectionYear: number,
		sectionAvg: number, sectionPass: number, sectionFail: number, sectionAudit: number) {
		this.sectionUUID = sectionUUID;
		this.sectionID = sectionID;
		this.sectionTitle = sectionTitle;
		this.sectionInstructor = sectionInstructor;
		this.sectionDept = sectionDept;
		this.sectionYear = sectionYear;
		this.sectionAvg = sectionAvg;
		this.sectionPass = sectionPass;
		this.sectionFail = sectionFail;
		this.sectionAudit = sectionAudit;
	}

	public get getSectionUUID(){
		return this.sectionUUID;
	}

	public get getSectionID(){
		return this.sectionID;
	}

	public get getSectionTitle(){
		return this.sectionTitle;
	}

	public get getSectionInstructor(){
		return this.sectionInstructor;
	}

	public get getSectionDept(){
		return this.sectionDept;
	}

	public get getSectionYear(){
		return this.sectionYear;
	}

	public get getSectionAvg(){
		return this.sectionAvg;
	}

	public get getSectionPass(){
		return this.sectionPass;
	}

	public get getSectionFail(){
		return this.sectionFail;
	}

	public get getSectionAudit(){
		return this.sectionAudit;
	}

}
