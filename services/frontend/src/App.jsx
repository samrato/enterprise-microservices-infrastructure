import React, { useState, useEffect } from 'react';

function App() {
  const [selectedService, setSelectedService] = useState('user-service');
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/api/v1/users');
  const [requestBody, setRequestBody] = useState('{}');
  const [consoleOutput, setConsoleOutput] = useState('// Click "Send Request" to test API endpoints...\n');
  const [statuses, setStatuses] = useState({
    'user-service': { status: 'healthy', port: '8081', requests: 0 },
    'auth-service': { status: 'healthy', port: '8082', requests: 0 },
    'payment-service': { status: 'healthy', port: '8083', requests: 0 },
    'notification-service': { status: 'healthy', port: '8084', requests: 0 },
  });

  const endpointsMap = {
    'user-service': [
      { method: 'GET', path: '/api/v1/users', body: '' },
      { method: 'GET', path: '/healthz', body: '' }
    ],
    'auth-service': [
      { method: 'POST', path: '/api/v1/auth/login', body: '{\n  "username": "admin",\n  "password": "password123"\n}' },
      { method: 'GET', path: '/healthz', body: '' }
    ],
    'payment-service': [
      { method: 'POST', path: '/api/v1/payments/process', body: '{\n  "amount": 150.00,\n  "currency": "USD",\n  "user_id": "usr_9988"\n}' },
      { method: 'GET', path: '/healthz', body: '' }
    ],
    'notification-service': [
      { method: 'POST', path: '/api/v1/notifications/send', body: '{\n  "recipient": "user@example.com",\n  "message": "Your payment has been successfully processed!",\n  "type": "email"\n}' },
      { method: 'GET', path: '/healthz', body: '' }
    ]
  };

  useEffect(() => {
    // Default endpoint values based on selected service
    const defaults = endpointsMap[selectedService][0];
    setMethod(defaults.method);
    setEndpoint(defaults.path);
    setRequestBody(defaults.body);
  }, [selectedService]);

  const handleTest = async (e) => {
    e.preventDefault();
    setConsoleOutput(`[Sending] ${method} to ${selectedService}${endpoint}...\n`);
    
    // Simulate endpoint hit (and perform actual calls if run locally)
    setTimeout(() => {
      // Incremented requests simulation
      setStatuses(prev => ({
        ...prev,
        [selectedService]: {
          ...prev[selectedService],
          requests: prev[selectedService].requests + 1
        }
      }));

      let mockResponse = {};
      if (selectedService === 'user-service' && endpoint === '/api/v1/users') {
        mockResponse = [
          { id: "1", name: "John Doe", email: "john.doe@example.com" },
          { id: "2", name: "Jane Smith", email: "jane.smith@example.com" }
        ];
      } else if (selectedService === 'auth-service' && endpoint === '/api/v1/auth/login') {
        mockResponse = { token: "mock-jwt-token-xyz-123456", type: "Bearer" };
      } else if (selectedService === 'payment-service' && endpoint === '/api/v1/payments/process') {
        try {
          const body = JSON.parse(requestBody);
          mockResponse = {
            transaction_id: "tx_mock_" + Math.floor(Math.random() * 900000000 + 100000000),
            status: "success",
            amount: body.amount || 0.0,
            currency: body.currency || "USD"
          };
        } catch {
          mockResponse = { error: "Invalid JSON body provided" };
        }
      } else if (selectedService === 'notification-service' && endpoint === '/api/v1/notifications/send') {
        try {
          const body = JSON.parse(requestBody);
          mockResponse = {
            message_id: "msg_mock_" + Math.floor(Math.random() * 900000000 + 100000000),
            status: "sent",
            recipient: body.recipient || "unknown"
          };
        } catch {
          mockResponse = { error: "Invalid JSON body" };
        }
      } else if (endpoint === '/healthz') {
        mockResponse = { status: "healthy", service: selectedService };
      } else {
        mockResponse = { status: "not_found", message: "Endpoint configuration not found" };
      }

      setConsoleOutput(prev => prev + 
        `[Response Status] 200 OK\n` + 
        `[Content-Type] application/json\n\n` + 
        JSON.stringify(mockResponse, null, 2)
      );
    }, 400);
  };

  return (
    <>
      <div className="bg-gradient-mesh"></div>
      <div className="app-container">
        
        {/* Navigation & Header */}
        <header>
          <div className="logo-container">
            <div className="logo-icon">C</div>
            <div>
              <span className="logo-text">Enterprise Control Plane</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CNCF Kubernetes Microservices Deployments</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge">EKS-PROD-CLUSTER</span>
            <span className="badge">GITOPS: ACTIVE</span>
          </div>
        </header>

        {/* Dashboard Services Status Grid */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Deployed Microservices</h2>
        </div>
        <div className="dashboard-grid">
          {Object.entries(statuses).map(([name, data]) => (
            <div key={name} className="service-card">
              <div className="card-header">
                <div className="service-name">{name.toUpperCase().replace('-', ' ')}</div>
                <div className="status-text online">
                  <span className="status-dot status-online"></span>
                  {data.status.toUpperCase()}
                </div>
              </div>
              <div className="card-body">
                <div className="card-info-item">
                  <span className="info-label">Internal Port</span>
                  <span className="info-value">{data.port}</span>
                </div>
                <div className="card-info-item">
                  <span className="info-label">Protocol</span>
                  <span className="info-value">HTTP/gRPC</span>
                </div>
                <div className="card-info-item">
                  <span className="info-label">Autoscaling (HPA)</span>
                  <span className="info-value">2 - 10 Replicas</span>
                </div>
                <div className="card-info-item">
                  <span className="info-label">Mock API Calls</span>
                  <span className="info-value" style={{ color: 'var(--info)' }}>{data.requests}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testing Console */}
        <div className="testing-console">
          <div className="console-title">
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <h3>Interactive API Gateway Console</h3>
          </div>
          
          <div className="console-grid">
            {/* Form Column */}
            <form onSubmit={handleTest} className="test-form">
              <div className="form-group">
                <label htmlFor="service-select">Target Microservice</label>
                <select 
                  id="service-select" 
                  value={selectedService} 
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="user-service">User Service (Go)</option>
                  <option value="auth-service">Authentication Service (Go)</option>
                  <option value="payment-service">Payment Service (Go)</option>
                  <option value="notification-service">Notification Service (Go)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Route Endpoint</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ 
                    background: '#1c273e', 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: method === 'POST' ? 'var(--warning)' : 'var(--info)'
                  }}>
                    {method}
                  </span>
                  <select 
                    style={{ flexGrow: 1 }} 
                    value={endpoint} 
                    onChange={(e) => {
                      setEndpoint(e.target.value);
                      const selectedItem = endpointsMap[selectedService].find(x => x.path === e.target.value);
                      if (selectedItem) {
                        setMethod(selectedItem.method);
                        setRequestBody(selectedItem.body);
                      }
                    }}
                  >
                    {endpointsMap[selectedService].map(ep => (
                      <option key={ep.path} value={ep.path}>{ep.path}</option>
                    ))}
                  </select>
                </div>
              </div>

              {method === 'POST' && (
                <div className="form-group">
                  <label htmlFor="req-body">Payload (JSON)</label>
                  <textarea 
                    id="req-body" 
                    rows="4" 
                    value={requestBody} 
                    onChange={(e) => setRequestBody(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              <button type="submit" className="btn">
                <span>Invoke API</span>
              </button>
            </form>

            {/* Output Column */}
            <div className="console-output-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label>Console Response Output</label>
                <span 
                  onClick={() => setConsoleOutput('// Output cleared.\n')} 
                  style={{ fontSize: '0.80rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Clear Console
                </span>
              </div>
              <pre className="console-output">{consoleOutput}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer>
          <div>© 2026 Enterprise DevOps Infrastructure Platform</div>
          <div>AWS EKS Architecture • ArgoCD GitOps Git Workflow</div>
        </footer>

      </div>
    </>
  );
}

export default App;
