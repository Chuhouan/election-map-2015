// 从完整数据集导出兼容 store 的格式
import { allConstituencies } from './constituencies-full'

export interface Constituency {
  id: number
  name: string
  region: string
  nation: string
  winningParty: string
  runnerUpParty: string
  winningCandidate: string
  runnerUpCandidate: string
  votes: number
  share: number
  majority: number
  swing: number
  turnout: number
  electorate: number
  declared: boolean
  marginal: boolean
  bellwether: boolean
  historicalResults: {
    year: number
    winningParty: string
    majority: number
    turnout: number
  }[]
  coordinates: {
    lat: number
    lng: number
  }
}

// 将完整数据转换为 store 兼容格式
export const constituencies: Constituency[] = allConstituencies.map(c => {
  const e2024 = c.elections[2024]
  const e2019 = c.elections[2019]
  const e2017 = c.elections[2017]
  const e2015 = c.elections[2015]

  return {
    id: c.id,
    name: c.name,
    region: c.region,
    nation: c.nation,
    winningParty: e2024.party,
    runnerUpParty: e2024.party === 'Labour' ? 'Conservative' : 'Labour',
    winningCandidate: `Candidate ${e2024.party}`,
    runnerUpCandidate: 'Opposition Candidate',
    votes: Math.round(50000 * (e2024.turnout / 100)),
    share: e2024.voteShare,
    majority: e2024.majority,
    swing: e2024.voteShare - (e2019.voteShare || 30),
    turnout: e2024.turnout,
    electorate: 75000,
    declared: true,
    marginal: e2024.majority < 10000,
    bellwether: Math.abs(e2024.voteShare - (e2019.voteShare || 30)) > 5,
    historicalResults: [
      { year: 2015, winningParty: e2015.party, majority: e2015.majority, turnout: e2015.turnout },
      { year: 2017, winningParty: e2017.party, majority: e2017.majority, turnout: e2017.turnout },
      { year: 2019, winningParty: e2019.party, majority: e2019.majority, turnout: e2019.turnout },
      { year: 2024, winningParty: e2024.party, majority: e2024.majority, turnout: e2024.turnout },
    ],
    coordinates: {
      lat: c.lat,
      lng: c.lng,
    },
  }
})

export const nationalStats = {
  totalSeats: 650,
  declaredSeats: 650,
  turnout: 60.0,
  swing: 4.1,
  partySeats: {
    Labour: 412,
    Conservative: 121,
    'Liberal Democrat': 71,
    SNP: 9,
    Green: 4,
    DUP: 5,
    SinnFein: 7,
    PlaidCymru: 4,
    Others: 17,
  },
  partyVoteShare: {
    Labour: 35.2,
    Conservative: 24.5,
    'Liberal Democrat': 12.2,
    SNP: 2.5,
    Green: 6.8,
    Others: 18.8,
  },
}
