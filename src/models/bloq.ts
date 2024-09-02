interface IBloq {
  id: string;
  title: string;
  address: string;
}

class Bloq implements IBloq {
  id: string;
  title: string;
  address: string;

  constructor(id: string, title: string, address: string) {
    this.id = id;
    this.title = title;
    this.address = address;
  }
}

export default Bloq;
