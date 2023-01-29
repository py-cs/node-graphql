export const enum Entities {
  MEMBER_TYPE = "Member type",
  USER = "User",
  POST = "Post",
  PROFILE = "Profile",
}

export const enum Errors {
  HAS_PROFILE = "User already has a profile",
  SELF_SUBSCRIBE = "User can't be subscribed to himself",
  ALREADY_SUBSCRIBED = "Already subscribed",
  NO_SUBSCRIPTION = "No active subscription",
}

export function entityNotFoundMessage(entity: Entities, id: string): string {
  return `${entity} with id ${id} not found`;
}
