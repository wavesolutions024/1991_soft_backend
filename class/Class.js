

export class Franchies {
    constructor(franch) {
        this.franchies = franch.franchies;
        this.address = franch.address;
        this.username = franch.username;
        this.password = franch.password;
    }
}

export class clients {
    constructor(clients){
        this.franchiesCode = clients.clients;
        this.name = clients.name;
        this.email = clients.email;
        this.mobileno = clients.mobileno;
        this.address = clients.address;
        this.dob = clients.dob;
        this.tattoodetails = clients.tattoodetails;
        this.inch = clients.inch;
        this.price = clients.price;
        this.tattooImage = clients.tattooImage;
    }
}

export class artists {
    constructor(artist){
        this.artistName = artist.artistNumber;

    }
}