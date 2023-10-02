export class Sections {
	private uuid: string;
	private id: string;
	private title: string;
	private instructor: string;
	private dept: string;
	private year: number;
	private avg: number;
	private pass: number;
	private fail: number;
	private audit: number;

	constructor(sectionUUID: string, sectionID: string, sectionTitle: string,
		sectionInstructor: string, sectionDept: string, sectionYear: number,
		sectionAvg: number, sectionPass: number, sectionFail: number, sectionAudit: number) {
		this.uuid = sectionUUID;
		this.id = sectionID;
		this.title = sectionTitle;
		this.instructor = sectionInstructor;
		this.dept = sectionDept;
		this.year = sectionYear;
		this.avg = sectionAvg;
		this.pass = sectionPass;
		this.fail = sectionFail;
		this.audit = sectionAudit;
	}

	public get getSectionUUID(){
		return this.uuid;
	}

	public get getSectionID(){
		return this.id;
	}

	public get getSectionTitle(){
		return this.title;
	}

	public get getSectionInstructor(){
		return this.instructor;
	}

	public get getSectionDept(){
		return this.dept;
	}

	public get getSectionYear(){
		return this.year;
	}

	public get getSectionAvg(){
		return this.avg;
	}

	public get getSectionPass(){
		return this.pass;
	}

	public get getSectionFail(){
		return this.fail;
	}

	public get getSectionAudit(){
		return this.audit;
	}


	public printALlFields(){
		// Print all the fields of the section in a readable manner
		let tmp: string = "sectionUUID: " + this.uuid + "\n" +
			"sectionID: " + this.id + "\n" +
			"sectionTitle: " + this.title + "\n" +
			"sectionInstructor: " + this.instructor + "\n" +
			"sectionDept: " + this.dept + "\n" +
			"sectionYear: " + this.year + "\n" +
			"sectionAvg: " + this.avg + "\n" +
			"sectionPass: " + this.pass + "\n" +
			"sectionFail: " + this.fail + "\n" +
			"sectionAudit: " + this.audit + "\n";
		console.log(tmp);
	}


}
