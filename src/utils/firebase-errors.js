export const handleServiceError = (error, context = 'Operation') => {
  const isApiDisabled = error.message.includes('Cloud Firestore API has not been used') || error.message.includes('PERMISSION_DENIED');
  const isNotFound = error.message.includes('NOT_FOUND') || error.message.includes('Database not found');
  
  const needsAction = isApiDisabled || isNotFound;
  
  let instructions = error.message;
  if (isApiDisabled) {
    instructions = `ACTION REQUIRED: Enable Cloud Firestore API for project ${process.env.FIREBASE_PROJECT_ID || 'asstella-cd3ac'}`;
  } else if (isNotFound) {
    instructions = `ACTION REQUIRED: Cloud Firestore Database not found. Check if the instance exists.`;
  }

  console.warn(`${context} failed:`, instructions);
  
  return {
    _error: instructions,
    _action_required: needsAction,
    _needs_api_enable: isApiDisabled,
    _needs_db_setup: isNotFound
  };
};
