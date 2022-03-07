const consoleTransport = (prefix) => ((
  timestamp, level, resourceType, resourceID, action, message, error,
) => {
  const args = [timestamp.toISOString(), level, resourceType, resourceID, action, message];

  if (error) { args.push(error); }
  if (prefix) { args.unshift(prefix); }

  console[level](...args);
});

export default consoleTransport;
