import { RentSize, RentStatus } from "./index"

interface IRent {
  id: string
  lockerId: string
  weight: number
  size: RentSize
  status: RentStatus
  createdAt?: Date
  droppedAt?: Date
  pickedUpAt?: Date
}

class Rent implements IRent {

  id: string
  lockerId: string
  weight: number
  size: RentSize
  status: RentStatus
  createdAt?: Date
  droppedAt?: Date
  pickedUpAt?: Date

  constructor(id: string, lockerId: string, weight: number, size: RentSize, status: RentStatus, createdAt?: Date, droppedAt?: Date, pickedUpAt?: Date) {
    this.id = id;
    this.lockerId = lockerId;
    this.weight = weight;
    this.size = size;
    this.status = status;
    if(createdAt) {
      this.createdAt = createdAt;
    }
    if(droppedAt) {
      this.droppedAt = droppedAt;
    }
    if(pickedUpAt) {
      this.pickedUpAt = pickedUpAt;
    }
  }
}

export default Rent;
