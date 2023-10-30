export class Rooms {
	private fullname: string;
	private shortname: string;
	private number: string;
	private name: string;
	private address: string;
	private lat: number;
	private lon: number;
	private seats: number;
	private type: string;
	private furniture: string;
	private href: string;

	private counter = 0;

	constructor() {
		this.fullname = "";
		this.shortname =  "";
		this.number =  "";
		this.name =  "";
		this.address =  "";
		this.lat = 0;
		this.lon = 0;
		this.seats = 0;
		this.type =  "";
		this.furniture =  "";
		this.href =  "";
	}

	public getFullName() {
		return this.fullname;
	}

	public getShortName() {
		return this.shortname;
	}

	public getNumber() {
		return this.number;
	}

	public getName() {
		return this.name;
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

	public getSeats() {
		return this.seats;
	}

	public getType() {
		return this.type;
	}

	public getFurniture() {
		return this.furniture;
	}

	public getHref() {
		return this.href;
	}

	public setFullName(fullname: string) {
		this.fullname = fullname;
		this.counter++;
	}

	public setShortName(shortname: string) {
		this.shortname = shortname;
		this.counter++;
	}

	public setNumber(number: string) {
		this.number = number;
		this.counter++;
	}

	public setName(name: string) {
		this.name = name;
		this.counter++;
	}

	public setAddress(address: string) {
		this.address = address;
		this.counter++;
	}

	public setLat(lat: number) {
		this.lat = lat;
		this.counter++;
	}

	public setLon(lon: number) {
		this.lon = lon;
		this.counter++;
	}

	public setSeats(seats: number) {
		this.seats = seats;
		this.counter++;
	}

	public setType(type: string) {
		this.type = type;
		this.counter++;
	}

	public setFurniture(furniture: string) {
		this.furniture = furniture;
		this.counter++;
	}

	public setHref(href: string) {
		this.href = href;
		this.counter++;
	}

	public getCounter(){
		return this.counter;
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
			"number: " +
			this.number +
			"\n" +
			"name: " +
			this.name +
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
			"seats: " +
			this.seats +
			"\n" +
			"type: " +
			this.type +
			"\n" +
			"furniture: " +
			this.furniture +
			"\n" +
			"href: " +
			this.href +
			"\n";
		console.log(tmp);
	}
}
