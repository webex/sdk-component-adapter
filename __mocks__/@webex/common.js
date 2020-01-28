export const deconstructHydraId = (ID) => {
  if (ID.includes('PEOPLE')) return {type: 'PEOPLE'};
  if (ID.includes('ROOM')) return {type: 'ROOM'};

  return {};
};
