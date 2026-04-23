import { db } from './firebase.js';

export async function reportCrash(error, context = {}) {
  const errorDetails = {
    message: error.message || 'Unknown Error',
    name: error.name || 'Error',
    stack: error.stack || '',
    context,
    timestamp: new Date().toISOString(),
    resolved: false
  };

  console.error('\n🚨 [CRASH REPORT]:', errorDetails.message);
  console.error(error.stack);
  
  if (db) {
    try {
      await db.collection('crash_reports').add(errorDetails);
      console.log('✅ Crash report sent to Firebase.');
    } catch (fbError) {
      console.error('❌ Failed to send crash report to Firebase:', fbError.message);
    }
  } else {
    console.warn('⚠️ Firebase is not initialized. Crash report is only logged to console.');
  }

  return errorDetails;
}

// Wrapper untuk menangkap error di Endpoint secara super lengkap
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      // Mengumpulkan konteks error (Query, IP, Headers)
      const context = {
        url: req.url,
        method: req.method,
        query: req.query,
        body: req.body,
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        tool: req.body?.tool || req.query?.tool || 'unknown'
      };

      const report = await reportCrash(error, context);

      res.status(500).json({
        error: {
          code: 500,
          message: 'Internal Server Error. The crash has been reported.',
          crash_id: report.timestamp, // Referensi untuk debug
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    }
  };
}
