export const ok = (res, data, message = 'Success', status = 200) => 
  res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });

export const fail = (res, message, code = 'ERROR', status = 400, details = null) => 
  res.status(status).json({
    success: false,
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  });
