export type CreatePollFields = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type JoinPollFields = {
  pollId: string;
  name: string;
};

export type RejoinPollFields = {
  pollId: string;
  userId: string;
  name: string;
};

export type CreatePollData = {
  pollId: string;
  topic: string;
  votesPerVoter: number;
  userId: string;
};

export type AddParticipantData = {
  pollId: string;
  userId: string;
  name: string;
};

type AuthPayload = {
  userId: string;
  pollId: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;
