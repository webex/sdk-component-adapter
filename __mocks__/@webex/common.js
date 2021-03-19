export const deconstructHydraId = (ID) => {
  if (ID.includes('PEOPLE')) return {type: 'PEOPLE'};
  if (ID.includes('ROOM')) return {type: 'ROOM'};
  if (ID.includes('personID')) return {id: ID};
  if (ID.includes('organizationID')) return {id: ID};

  return {};
};

export const SDK_EVENT = {
  EXTERNAL: {
    EVENT_TYPE: {
      CREATED: 'created',
      DELETED: 'deleted',
    },
  },
};
