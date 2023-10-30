export class Building {
	private fullname: string;
	private shortname: string;
	private address: string;
	private lat: number;
	private lon: number;
	private href: string;

	constructor() {
		this.fullname = "";
		this.shortname = "";
		this.address = "";
		this.lat = 0;
		this.lon = 0;
		this.href = "";
	}

	public getFullName() {
		return this.fullname;
	}

	public getShortName() {
		return this.shortname;
	}

	public getAddress() {
		return this.address;
	}

	public getLat() {
		return this.lat;
	}

	public getLon() {
		return this.lon;
	}

	public getHref() {
		return this.href;
	}

	public setFullName(fullname: string) {
		this.fullname = fullname;
	}

	public setShortName(shortname: string) {
		this.shortname = shortname;
	}

	public setAddress(address: string) {
		this.address = address;
	}

	public setLat(lat: number) {
		this.lat = lat;
	}

	public setLon(lon: number) {
		this.lon = lon;
	}

	public setHref(href: string) {
		this.href = href;
	}

	public printALlFields() {
		// Print all the fields of the section in a readable manner
		let tmp: string =
			"fullname: " +
			this.fullname +
			"\n" +
			"shortname: " +
			this.shortname +
			"\n" +
			"address: " +
			this.address +
			"\n" +
			"lat: " +
			this.lat +
			"\n" +
			"lon: " +
			this.lon +
			"\n" +
			"href: " +
			this.href +
			"\n";
		console.log(tmp);
	}
}
