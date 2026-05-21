export interface RaidPartyContract {
  id: string

  dungeonId: string

  members: RaidMemberContract[]

  status: RaidStatus
}

export type RaidStatus =
  | "FORMING"
  | "ACTIVE"
  | "FAILED"
  | "COMPLETED"

export interface RaidMemberContract {
  playerId: string

  username: string

  role: RaidRole
}

export type RaidRole =
  | "LISTENER"
  | "SPEAKER"
  | "SCOUT"
  | "SCHOLAR"