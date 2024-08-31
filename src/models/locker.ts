import { LockerStatus } from "./lockerStatus.enum"

interface ILocker {
  id: string
  bloqId: string
  status: LockerStatus
  isOccupied: boolean
}

class Locker implements ILocker {
  id: string;
  bloqId: string;
  status: LockerStatus;
  isOccupied: boolean;

  constructor(id: string, bloqId: string, status: LockerStatus, isOccupied: boolean) {
    this.id = id;
    this.bloqId = bloqId;
    this.status = status;
    this.isOccupied = isOccupied;
  }
}

export default Locker;
