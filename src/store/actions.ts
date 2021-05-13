export const UPDATE_USER_ACTION = "UpdateUserAction";
export const UPDATE_STREAMS = "UpdateStreams";
export const UPDATE_TOASTS = "UpdateToasts";
export const UPDATE_COOKBOOK = "UpdateCookbook";

export function updateUser(user) {
  return {
    type: UPDATE_USER_ACTION,
    payload: user,
  };
}

export function updateStreams(streams) {
  return {
    type: UPDATE_STREAMS,
    payload: streams,
  };
}

export function updateToasts(toasts) {
  return {
    type: UPDATE_TOASTS,
    payload: toasts,
  };
}

export function updateCookbook(cookbook) {
  return {
    type: UPDATE_COOKBOOK,
    payload: cookbook,
  };
}
