import axios from 'axios';

// Python backend URL
const PYTHON_BACKEND_URL = 'http://localhost:8000';

// Connection health check
export const checkPythonBackendHealth = async () => {
    try {
        const response = await axios.get(`${PYTHON_BACKEND_URL}/health`, {
            timeout: 5000
        });
        return response.status === 200;
    } catch (error) {
        console.error('Python backend health check failed:', error.code);
        return false;
    }
};

// Retry function with exponential backoff
export const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Don't retry for certain error types
            if (error.code === 'ECONNABORTED' ||
                error.response?.status === 400) {
                console.log(`Request was aborted, not retrying: ${error.code || error.message}`);
                throw error;
            }
            
            // Don't retry if it's a validation error
            if (error.response?.status >= 400 && error.response?.status < 500) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
            console.log(`Error: ${error.code || error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Enhanced axios instance with better error handling
export const createPythonBackendClient = () => {
    const client = axios.create({
        baseURL: PYTHON_BACKEND_URL,
        timeout: 180000, // 3 minutes for AI processing
        headers: {
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=60'
        }
    });

    // Response interceptor for better error handling
    client.interceptors.response.use(
        response => response,
        error => {
            // Log connection errors for debugging
            if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
                console.error(`Python backend connection error: ${error.code}`);
            }
            return Promise.reject(error);
        }
    );

    return client;
};

// Wait for Python backend to be ready
export const waitForPythonBackend = async (maxWait = 30000, checkInterval = 2000) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
        if (await checkPythonBackendHealth()) {
            console.log('✅ Python backend is ready');
            return true;
        }
        
        console.log('⏳ Waiting for Python backend to be ready...');
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.error('❌ Python backend did not become ready within timeout');
    return false;
};
